import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface SectionHeadingProps {
  title: string
  description?: string
  /** Optional right-aligned action slot (button, link, select, etc.). */
  action?: ReactNode
  /** Heading level for semantic structure. */
  as?: "h1" | "h2" | "h3" | "h4"
  className?: string
}

const headingClasses: Record<NonNullable<SectionHeadingProps["as"]>, string> = {
  h1: "text-3xl font-bold tracking-tight sm:text-4xl",
  h2: "text-2xl font-bold tracking-tight sm:text-3xl",
  h3: "text-lg font-semibold tracking-tight",
  h4: "text-base font-semibold",
    }

/**
 * Section heading with optional description and right-aligned action slot.
 */
export function SectionHeading({
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className
      )}
    >
      <div className="space-y-1">
        <Tag className={headingClasses[Tag]}>{title}</Tag>
        {description ? (
          <p className="max-w-2xl text-sm text-balance text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
