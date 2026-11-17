"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PaginationMode =
  | "controlled"
  | "href"

export interface PageLinkBuilder {
  /** Builds the href for a given page number. */
  href: (page: number) => string
}

export interface PaginationProps {
  /** Current page (1-based). */
  page: number
  /** Total number of pages; must be >= 1. */
  totalPages: number
  /** Controlled mode: called when the user selects a page. */
  onPageChange?: (page: number) => void
  /** Link mode: builds an href for each page (URL-param friendly). */
  buildHref?: (page: number) => string
  /** Number of page buttons to render around the current page. */
  siblingCount?: number
  className?: string
}

/** Builds a compact page list with ellipses: 1 … 4 5 6 … 20 */
function buildPageRange(
  page: number,
  totalPages: number,
  siblingCount: number
): Array<number | "ellipsis-start" | "ellipsis-end"> {
  const totalSlots = siblingCount * 2 + 5

  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const start = Math.max(2, page - siblingCount)
  const end = Math.min(totalPages - 1, page + siblingCount)
  const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1]

  if (start > 2) {
    pages.push("ellipsis-start")
  }

  for (let p = start; p <= end; p += 1) {
    pages.push(p)
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis-end")
  }

  pages.push(totalPages)
  return pages
}

/**
 * Page navigation with correct disable/ellipsize behavior.
 *
 * - Pass `onPageChange` for controlled usage (buttons).
 * - Pass `buildHref` for URL-driven usage (renders as links).
 * - With neither, buttons render disabled (safe no-op display).
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  buildHref,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const items = buildPageRange(safePage, totalPages, siblingCount)
  const hasPrev = safePage > 1
  const hasNext = safePage < totalPages

  const renderPageButton = (targetPage: number) => {
    const isActive = targetPage === safePage
    const label = `Go to page ${targetPage}`

    if (buildHref) {
      return (
        <Button
          key={targetPage}
          variant={isActive ? "outline" : "ghost"}
          size="icon"
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
          className={cn("aria-[current=page]:pointer-events-none")}
          render={<a href={buildHref(targetPage)} />}
        >
          {targetPage}
        </Button>
      )
    }

    return (
      <Button
        key={targetPage}
        variant={isActive ? "outline" : "ghost"}
        size="icon"
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={cn("aria-[current=page]:pointer-events-none")}
        onClick={onPageChange ? () => onPageChange(targetPage) : undefined}
        disabled={!onPageChange}
      >
        {targetPage}
      </Button>
    )
  }

  const renderNavButton = (
    targetPage: number,
    kind: "prev" | "next"
  ) => {
    const isPrev = kind === "prev"
    const enabled = isPrev ? hasPrev : hasNext
    const ariaLabel = isPrev ? "Go to previous page" : "Go to next page"
    const className = isPrev ? "pl-2!" : "pr-2!"

    if (buildHref && enabled) {
      return (
        <Button
          variant="ghost"
          size="default"
          aria-label={ariaLabel}
          className={className}
          render={<a href={buildHref(targetPage)} />}
        >
          {isPrev ? (
            <ChevronLeftIcon data-icon="inline-start" />
          ) : null}
          <span className="hidden sm:block">{isPrev ? "Previous" : "Next"}</span>
          {!isPrev ? (
            <ChevronRightIcon data-icon="inline-end" />
          ) : null}
        </Button>
      )
    }

    return (
      <Button
        variant="ghost"
        size="default"
        aria-label={ariaLabel}
        className={className}
        onClick={enabled && onPageChange ? () => onPageChange(targetPage) : undefined}
        disabled={!enabled || !onPageChange}
      >
        {isPrev ? <ChevronLeftIcon data-icon="inline-start" /> : null}
        <span className="hidden sm:block">{isPrev ? "Previous" : "Next"}</span>
        {!isPrev ? <ChevronRightIcon data-icon="inline-end" /> : null}
      </Button>
    )
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center", className)}
    >
      <ul className="flex flex-wrap items-center gap-1">
        <li>{renderNavButton(safePage - 1, "prev")}</li>
        {items.map((item) => (
          <li key={item}>
            {item === "ellipsis-start" || item === "ellipsis-end" ? (
              <span
                aria-hidden
                className="flex size-9 items-center justify-center text-muted-foreground"
              >
                <EllipsisIcon className="size-4" />
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              renderPageButton(item)
            )}
          </li>
        ))}
        <li>{renderNavButton(safePage + 1, "next")}</li>
      </ul>
    </nav>
  )
}
