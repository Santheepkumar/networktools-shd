import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Globe, PlayCircle, Code2 } from 'lucide-react'

const TOOL_LINKS = [
  { href: '/tools/dns-lookup', label: 'DNS Lookup' },
  { href: '/tools/whois', label: 'WHOIS Lookup' },
  { href: '/tools/ssl-checker', label: 'SSL Checker' },
  { href: '/tools/port-checker', label: 'Port Checker' },
  { href: '/tools/http-headers', label: 'HTTP Headers' },
  { href: '/tools/domain-security', label: 'Domain Security' },
  { href: '/tools/ip-geolocation', label: 'IP Geolocation' },
  { href: '/tools/ping', label: 'Ping' },
]

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div className="space-y-4">
            {/* Light logo (shown in light mode), dark logo (shown in dark mode) */}
            <div>
              <Image
                src="/logo-light.svg"
                alt="StrawHatDevs"
                width={180}
                height={40}
                className="h-9 w-auto dark:hidden"
              />
              <Image
                src="/logo-dark.svg"
                alt="StrawHatDevs"
                width={180}
                height={40}
                className="h-9 w-auto hidden dark:block"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[28ch]">
              Developer tools, tutorials, and open-source projects — built for the community.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://youtube.com/@strawhatdevs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StrawHatDevs on YouTube"
                className="cursor-pointer text-muted-foreground hover:text-[#19D7C1] transition-colors"
              >
              <PlayCircle className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://github.com/strawhatdevs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StrawHatDevs on GitHub"
                className="cursor-pointer text-muted-foreground hover:text-[#19D7C1] transition-colors"
              >
                <Code2 className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://strawhatdevs.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="StrawHatDevs website"
                className="cursor-pointer text-muted-foreground hover:text-[#19D7C1] transition-colors"
              >
                <Globe className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Popular tools */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#19D7C1] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About / promo */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              This tool suite is built and maintained by{' '}
              <a
                href="https://strawhatdevs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#19D7C1] hover:underline cursor-pointer font-medium"
              >
                StrawHatDevs
              </a>{' '}
              — a developer community focused on practical tools, open-source, and education.
            </p>
            <a
              href="https://strawhatdevs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-1.5 text-sm font-medium
                text-[#06131F] dark:text-[#06131F]
                bg-[#19D7C1] hover:bg-[#00c4b0]
                px-4 py-2 rounded-xl
                transition-colors cursor-pointer
              "
            >
              Visit StrawHatDevs
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StrawHatDevs. All tools run server-side — no data is stored.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js 16 · Open source
          </p>
        </div>
      </div>
    </footer>
  )
}
