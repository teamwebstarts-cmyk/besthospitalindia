import { cn } from "@/lib/utils"

/** One "jump to" target: an in-page anchor and its label. */
export interface AnchorNavItem {
  id: string
  label: string
}

export interface AnchorNavProps {
  items: readonly AnchorNavItem[]
  /** Accessible label for the nav landmark. */
  label?: string
  className?: string
}

/**
 * Anchored in-page navigation for long editorial pages ("Jump to a rating
 * type"). Anchor links preserve keyboard focus semantics and scroll the
 * target under the sticky header offset via `scroll-mt-*` on sections.
 */
export function AnchorNav({
  items,
  label = "On this page",
  className,
}: AnchorNavProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label={label}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl bg-card p-4 shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      <span className="text-sm font-medium text-foreground">{label}:</span>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
