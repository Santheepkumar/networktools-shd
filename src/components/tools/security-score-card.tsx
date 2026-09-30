'use client'

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SecurityCheck {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail' | 'info'
  message: string
  detail?: string
}

interface SecurityScanResult {
  domain: string
  score: number
  maxScore: number
  grade: string
  checks: SecurityCheck[]
}

const STATUS_ICON = { pass: CheckCircle, warn: AlertTriangle, fail: XCircle, info: Info }
const STATUS_COLOR = { pass: 'text-[rgb(var(--success))]', warn: 'text-[rgb(var(--warning))]', fail: 'text-destructive', info: 'text-primary' }
const STATUS_BG = {
  pass: 'bg-[rgb(var(--success)_/_0.08)] border-[rgb(var(--success)_/_0.2)]',
  warn: 'bg-[rgb(var(--warning)_/_0.08)] border-[rgb(var(--warning)_/_0.2)]',
  fail: 'bg-destructive/8 border-destructive/20',
  info: 'bg-primary/8 border-primary/20',
}

function getGradeColor(grade: string) {
  if (grade.startsWith('A')) return 'text-[rgb(var(--success))]'
  if (grade.startsWith('B')) return 'text-primary'
  if (grade.startsWith('C')) return 'text-[rgb(var(--warning))]'
  return 'text-destructive'
}

function getScoreBarColor(score: number, max: number) {
  const pct = score / max
  if (pct >= 0.8) return 'bg-[rgb(var(--success))]'
  if (pct >= 0.6) return 'bg-primary'
  if (pct >= 0.4) return 'bg-[rgb(var(--warning))]'
  return 'bg-destructive'
}

export function SecurityScoreCard({ result }: { result: unknown }) {
  const data = result as SecurityScanResult
  if (!data || typeof data !== 'object') return null

  const { score, maxScore, grade, checks = [], domain } = data
  const pct = Math.round((score / maxScore) * 100)
  const passingChecks = checks.filter((c) => c.status === 'pass')
  const failingChecks = checks.filter((c) => c.status === 'fail')
  const warnChecks = checks.filter((c) => c.status === 'warn')

  return (
    <div className="p-6">
      <div className="flex items-start gap-6 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <span className="text-4xl font-bold text-foreground tracking-tight">{score}</span>
            <span className="text-lg text-muted-foreground">/ {maxScore}</span>
            <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>Grade {grade}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Security score for {domain}</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(score, maxScore)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Pass', count: passingChecks.length, color: 'text-[rgb(var(--success))]' },
            { label: 'Warn', count: warnChecks.length, color: 'text-[rgb(var(--warning))]' },
            { label: 'Fail', count: failingChecks.length, color: 'text-destructive' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${color}`}>{count}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {checks.map((check) => {
          const Icon = STATUS_ICON[check.status]
          return (
            <div key={check.id} className={`flex items-start gap-3 p-3 rounded-xl border ${STATUS_BG[check.status]}`}>
              <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${STATUS_COLOR[check.status]}`} strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.message}</p>
                {check.detail && <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all">{check.detail}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
