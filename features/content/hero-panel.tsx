import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface HeroSearchPanelProps {
  /** Page H1 (single top-level heading of the home page). */
  heading: string
  /** Lead paragraph under the H1. */
  subheading: string
  /** Search island (GlobalSearch or the local fallback form). */
  searchSlot: ReactNode
  /** Quick links under the search (entity directories). */
  quickLinks?: readonly { label: string; href: string }[]
  /** Small trust line under the quick links (derived fixture counts). */
  trustLine?: string
  className?: string
}

/**
 * Home hero: H1 + lead copy + search island + quick links. The search island
 * is passed in by the page so the hero stays decoupled from the discovery
 * feature (server-component safe).
 */
export function HeroSearchPanel({
  heading,
  subheading,
  searchSlot,
  quickLinks,
  trustLine,
  className,
}: HeroSearchPanelProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          International Urban Forum Supported Initiative
        </p>
        <h1 className="text-4xl leading-[1.2] font-bold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.2]">
          {heading}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {subheading}
        </p>
      </div>
      {searchSlot ? (
        <div className="rounded-xl border bg-card p-4 shadow-md sm:p-5">
          {searchSlot}
        </div>
      ) : null}
      {quickLinks && quickLinks.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Quick links">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {trustLine ? (
        <p className="text-sm text-muted-foreground">
          {trustLine} All data on this page is fictional demo data.
        </p>
      ) : null}
    </div>
  )
}
