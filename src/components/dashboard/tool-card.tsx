import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { type ToolDefinition, CATEGORIES } from '@/lib/tools-registry'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: ToolDefinition
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon
  const categoryLabel = CATEGORIES[tool.category].label

  return (
    <Link href={`/tools/${tool.slug}`} className="group block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
      <div
        className="
          relative h-full
          bg-card border border-border
          rounded-2xl p-5
          shadow-card
          transition-[transform,shadow] duration-200 ease-out
          group-hover:-translate-y-[2px] group-hover:shadow-card-hover
          group-active:scale-[0.98] group-active:translate-y-0
        "
      >
        {/* Pro badge */}
        {tool.badge && (
          <Badge className="absolute top-3 right-3 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
            {tool.badge}
          </Badge>
        )}

        {/* Icon */}
        <div className={cn('mb-3', tool.accentColor)}>
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm text-foreground tracking-tight leading-snug mb-1">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Category badge */}
        <div className="mt-3">
          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            {categoryLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
