import { NextRequest } from 'next/server'
import tls from 'node:tls'
import net from 'node:net'
import { domainSecuritySchema } from '@/lib/validators'

export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function apiPost(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = domainSecuritySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { domain } = parsed.data

    // Run all checks in parallel
    const [sslResult, spfResult, dkimResult, dmarcResult, whoisResult, headerResult, dnsResult] =
      await Promise.allSettled([
        apiPost('/api/tools/ssl-checker', { domain }),
        apiPost('/api/tools/spf-checker', { domain }),
        apiPost('/api/tools/dkim-checker', { domain, selector: 'default' }),
        apiPost('/api/tools/dmarc-checker', { domain }),
        apiPost('/api/tools/whois', { domain }),
        apiPost('/api/tools/http-headers', { url: `https://${domain}` }),
        apiPost('/api/tools/dns-lookup', { domain, recordType: 'A' }),
      ])

    const get = (result: PromiseSettledResult<any>) =>
      result.status === 'fulfilled' ? result.value : null

    const ssl = get(sslResult)
    const spf = get(spfResult)
    const dkim = get(dkimResult)
    const dmarc = get(dmarcResult)
    const whois = get(whoisResult)
    const headers = get(headerResult)
    const dns = get(dnsResult)

    const checks: { id: string; label: string; status: 'pass' | 'warn' | 'fail' | 'info'; message: string; detail?: string; points: number; maxPoints: number }[] = []

    // SSL Check (20 points)
    if (ssl?.success && ssl.data) {
      const d = ssl.data
      if (d.isExpired) {
        checks.push({ id: 'ssl', label: 'SSL Certificate', status: 'fail', message: 'Certificate is expired', detail: `Expired ${Math.abs(d.daysRemaining)} days ago`, points: 0, maxPoints: 20 })
      } else if (d.isExpiringSoon) {
        checks.push({ id: 'ssl', label: 'SSL Certificate', status: 'warn', message: `Expiring in ${d.daysRemaining} days`, detail: d.issuer?.O, points: 10, maxPoints: 20 })
      } else {
        checks.push({ id: 'ssl', label: 'SSL Certificate', status: 'pass', message: `Valid for ${d.daysRemaining} more days (Grade ${d.grade})`, detail: `Issued by ${d.issuer?.O}`, points: 20, maxPoints: 20 })
      }
    } else {
      checks.push({ id: 'ssl', label: 'SSL Certificate', status: 'fail', message: 'Could not verify SSL certificate', points: 0, maxPoints: 20 })
    }

    // SPF Check (15 points)
    if (spf?.success && spf.data) {
      const d = spf.data
      if (!d.hasSpf) {
        checks.push({ id: 'spf', label: 'SPF Record', status: 'fail', message: 'No SPF record found — email spoofing risk', points: 0, maxPoints: 15 })
      } else if (d.warnings?.length > 0) {
        checks.push({ id: 'spf', label: 'SPF Record', status: 'warn', message: d.warnings[0], detail: d.record, points: 8, maxPoints: 15 })
      } else {
        checks.push({ id: 'spf', label: 'SPF Record', status: 'pass', message: 'Valid SPF record found', detail: d.record, points: 15, maxPoints: 15 })
      }
    } else {
      checks.push({ id: 'spf', label: 'SPF Record', status: 'fail', message: 'SPF check failed', points: 0, maxPoints: 15 })
    }

    // DKIM Check (15 points)
    if (dkim?.success && dkim.data) {
      const d = dkim.data
      if (!d.found) {
        checks.push({ id: 'dkim', label: 'DKIM Record', status: 'warn', message: 'No DKIM record found at default selector', detail: 'Try other selectors (google, selector1)', points: 5, maxPoints: 15 })
      } else if (d.warnings?.length > 0) {
        checks.push({ id: 'dkim', label: 'DKIM Record', status: 'warn', message: d.warnings[0], points: 8, maxPoints: 15 })
      } else {
        checks.push({ id: 'dkim', label: 'DKIM Record', status: 'pass', message: `Valid DKIM record (${d.keyType?.toUpperCase() || 'RSA'})`, detail: `Selector: ${d.selector}`, points: 15, maxPoints: 15 })
      }
    } else {
      checks.push({ id: 'dkim', label: 'DKIM Record', status: 'warn', message: 'DKIM check failed', points: 0, maxPoints: 15 })
    }

    // DMARC Check (15 points)
    if (dmarc?.success && dmarc.data) {
      const d = dmarc.data
      if (!d.hasDmarc) {
        checks.push({ id: 'dmarc', label: 'DMARC Policy', status: 'fail', message: 'No DMARC record — email spoofing unprotected', points: 0, maxPoints: 15 })
      } else if (d.policy === 'none') {
        checks.push({ id: 'dmarc', label: 'DMARC Policy', status: 'warn', message: 'DMARC policy is "none" — not enforcing', detail: d.record, points: 8, maxPoints: 15 })
      } else {
        checks.push({ id: 'dmarc', label: 'DMARC Policy', status: 'pass', message: `Policy: ${d.policy} (${d.percentage}% enforcement)`, detail: d.record, points: 15, maxPoints: 15 })
      }
    } else {
      checks.push({ id: 'dmarc', label: 'DMARC Policy', status: 'fail', message: 'DMARC check failed', points: 0, maxPoints: 15 })
    }

    // Security Headers Check (15 points)
    if (headers?.success && headers.data) {
      const d = headers.data
      const { score, maxScore, grade } = d.securityScore
      if (score === 0) {
        checks.push({ id: 'headers', label: 'Security Headers', status: 'fail', message: 'No security headers found', detail: `Missing: ${d.missingSecurityHeaders.join(', ')}`, points: 0, maxPoints: 15 })
      } else if (score < maxScore) {
        checks.push({ id: 'headers', label: 'Security Headers', status: 'warn', message: `${score}/${maxScore} security headers present (Grade ${grade})`, detail: `Missing: ${d.missingSecurityHeaders.join(', ')}`, points: Math.round((score / maxScore) * 15), maxPoints: 15 })
      } else {
        checks.push({ id: 'headers', label: 'Security Headers', status: 'pass', message: 'All required security headers present', points: 15, maxPoints: 15 })
      }
    } else {
      checks.push({ id: 'headers', label: 'Security Headers', status: 'warn', message: 'Could not check security headers', points: 0, maxPoints: 15 })
    }

    // DNS Check (10 points)
    if (dns?.success && dns.data && dns.data.length > 0) {
      checks.push({ id: 'dns', label: 'DNS Records', status: 'pass', message: `Domain resolves (${dns.data.length} A record${dns.data.length !== 1 ? 's' : ''})`, detail: dns.data[0]?.value, points: 10, maxPoints: 10 })
    } else {
      checks.push({ id: 'dns', label: 'DNS Records', status: 'fail', message: 'Domain does not resolve', points: 0, maxPoints: 10 })
    }

    // WHOIS Privacy Check (10 points)
    if (whois?.success && whois.data) {
      const d = whois.data
      const isPrivate = d.registrar?.toLowerCase().includes('privacy') ||
        d.registrar?.toLowerCase().includes('whoisguard') ||
        String(d.abuse || '').includes('proxy')
      const expiryDate = d.expiresDate ? new Date(d.expiresDate) : null
      const daysToExpiry = expiryDate ? Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      if (daysToExpiry !== null && daysToExpiry < 30) {
        checks.push({ id: 'whois', label: 'Domain Registration', status: 'warn', message: `Domain expires in ${daysToExpiry} days!`, detail: `Registrar: ${d.registrar}`, points: 5, maxPoints: 10 })
      } else {
        checks.push({ id: 'whois', label: 'Domain Registration', status: 'pass', message: `Valid${daysToExpiry ? ` — expires in ${daysToExpiry} days` : ''}`, detail: `Registrar: ${d.registrar || 'Unknown'}`, points: 10, maxPoints: 10 })
      }
    } else {
      checks.push({ id: 'whois', label: 'Domain Registration', status: 'info', message: 'WHOIS data unavailable', points: 0, maxPoints: 10 })
    }

    const score = checks.reduce((sum, c) => sum + c.points, 0)
    const maxScore = checks.reduce((sum, c) => sum + c.maxPoints, 0)
    const pct = score / maxScore
    const grade = pct >= 0.9 ? 'A' : pct >= 0.8 ? 'A' : pct >= 0.7 ? 'B' : pct >= 0.6 ? 'C' : pct >= 0.5 ? 'D' : 'F'

    return Response.json({
      success: true,
      data: { domain, score, maxScore, grade, checks },
    })
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : 'Security scan failed' },
      { status: 500 }
    )
  }
}
