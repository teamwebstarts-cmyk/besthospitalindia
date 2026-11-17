import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  /** Omit for the current page (renders as non-link text). */
  href?: string
}

export interface BreadcrumbsProps {
  /** Trail from first (root) to last (current page). */
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb trail with chevron separators. The last item renders as the
 * current page. Hidden on the smallest screens (`sr-only` on mobile) so
 * detail pages can start with the page title on phones.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="hidden flex-wrap items-center gap-1.5 text-sm text-muted-foreground md:flex">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-normal text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
              {!isLast ? (
                <ChevronRightIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground/70" />
              ) : null}
            </li>
          )
        })}
      </ol>
      <p className="sr-only md:hidden">{items[items.length - 1]?.label}</p>
    </nav>
  )
}
