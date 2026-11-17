import Link from "next/link"

import { cn } from "@/lib/utils"

export interface ContentLinkGroupProps {
  /** Section heading (rendered at H3 level). */
  title: string
  /** Short helper line under the heading. */
  description?: string
  /** Internal links to related routes. */
  links: readonly { label: string; href: string }[]
  className?: string
}

/**
 * "Supporting links" block used at the bottom of informational and legal
 * pages. All links are typed internal routes.
 */
export function ContentLinkGroup({
  title,
  description,
  links,
  className,
}: ContentLinkGroupProps) {
  return (
    <nav
      aria-label={title}
      className={cn(
        "rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
