import { TOOLS, CATEGORIES, CATEGORY_ORDER, getToolsByCategory } from '@/lib/tools-registry'
import { ToolCard } from '@/components/dashboard/tool-card'
import { Search } from 'lucide-react'


export const metadata = {
  title: 'Network Tools by StrawHatDevs — DNS, Security & HTTP Diagnostics',
  description: '22+ free network diagnostic tools by StrawHatDevs: DNS lookup, WHOIS, SSL checker, ping, traceroute, port checker, HTTP headers, and more.',
}

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden">
      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <div className="mb-14">
            {/* Brand badge */}
            <a
              href="https://strawhatdevs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-[#19D7C1]/40 bg-[#19D7C1]/8 text-xs font-medium text-[#19D7C1] hover:bg-[#19D7C1]/15 transition-colors cursor-pointer"
            >
              <img src="/logo-icon.svg" alt="" className="h-4 w-4" aria-hidden />
              A StrawHatDevs open-source project
            </a>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-3">
              Network Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-[55ch] leading-relaxed">
              {TOOLS.length} free tools for DNS analysis, security auditing, HTTP inspection, and network diagnostics — built by{' '}
              <a
                href="https://strawhatdevs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#19D7C1] font-medium hover:underline cursor-pointer"
              >
                StrawHatDevs
              </a>
              .
            </p>
          </div>

          {/* Category sections */}
          {CATEGORY_ORDER.map((category) => {
            const tools = getToolsByCategory(category)
            if (tools.length === 0) return null
            const { label, description } = CATEGORIES[category]

            return (
              <section key={category} className="mb-12">
                {/* Section header */}
                <div className="flex items-baseline gap-3 mb-5">
                  <h2 className="font-semibold text-base text-foreground tracking-tight">
                    {label}
                  </h2>
                  <span className="text-sm text-muted-foreground">{description}</span>
                </div>

                {/* Tool cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
