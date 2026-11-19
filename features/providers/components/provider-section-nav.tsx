"use client"

/**
 * ProviderSectionNav — anchored section navigation for long provider profiles
 * (Agent A05). Contract source: implementation/08-component-catalog.md —
 * "Scroll or tab to profile sections". Renders a scrollable anchor-link row
 * (mobile: horizontal scroll strip; desktop: wrapped/inline list). Links use
 * `#hash` targets inside the page; sections must carry matching element ids.
 *
 * Accessibility: a `<nav>` landmark labelled "On this page"; each link exposes
 * the target section name; active-section tracking highlights the current
 * anchor via IntersectionObserver and reflects it with `aria-current`.
 */

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface ProviderSectionNavLink {
  /** DOM id of the target section (element with this id must exist on the page). */
  id: string
  /** Visible link text, e.g. "Credentials". */
  label: string
}

export interface ProviderSectionNavProps {
  /** Anchored sections, in page order. */
  sections: ProviderSectionNavLink[]
  /** aria-label for the nav landmark (defaults to "On this page"). */
  label?: string
  className?: string
}

export function ProviderSectionNav({ sections, label = "On this page", className }: ProviderSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!activeId || !listRef.current) return
    const list = listRef.current
    const item = list.querySelector<HTMLElement>(`[data-section-id="${activeId}"]`)
    if (!item) return
    const itemLeft = item.offsetLeft
    const itemRight = itemLeft + item.offsetWidth
    const viewLeft = list.scrollLeft
    const viewRight = viewLeft + list.clientWidth
    if (itemLeft < viewLeft) {
      list.scrollTo({ left: Math.max(0, itemLeft - 12), behavior: "smooth" })
    } else if (itemRight > viewRight) {
      list.scrollTo({ left: itemRight - list.clientWidth + 12, behavior: "smooth" })
    }
  }, [activeId])

  useEffect(() => {
    if (sections.length === 0) return

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const visibleCounts = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleCounts.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let bestId: string | null = null
        let bestRatio = 0
        for (const element of elements) {
          const ratio = visibleCounts.get(element.id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = element.id
          }
        }
        setActiveId(bestId)
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    for (const element of elements) {
      observer.observe(element)
    }
    return () => observer.disconnect()
  }, [sections])

  if (sections.length === 0) {
    return null
  }

  return (
    <nav
      aria-label={label}
      data-slot="provider-section-nav"
      className={cn(
        "relative max-lg:-mx-1 max-lg:sticky max-lg:top-[calc(var(--site-header-offset,3.5rem)+0.25rem)] max-lg:z-30 max-lg:border-b max-lg:border-border/60 max-lg:bg-background/95 max-lg:py-2 max-lg:backdrop-blur-md",
        "max-lg:after:pointer-events-none max-lg:after:absolute max-lg:after:top-0 max-lg:after:right-0 max-lg:after:bottom-0 max-lg:after:w-6 max-lg:after:bg-gradient-to-l max-lg:after:from-background max-lg:after:to-transparent",
        className,
      )}
    >
      <ul
        ref={listRef}
        className={cn(
          "flex gap-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden",
          "max-lg:snap-x max-lg:snap-mandatory",
        )}
      >
        {sections.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id} data-section-id={section.id} className="shrink-0 snap-start">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border border-transparent px-3.5 text-xs font-semibold whitespace-nowrap text-muted-foreground transition-colors sm:h-8 sm:rounded-md sm:px-3 sm:text-sm sm:font-medium",
                  "hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
                  isActive && "border-primary/25 bg-primary/10 text-primary"
                )}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
