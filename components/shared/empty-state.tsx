import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateAction {
  label: string
  /** Client-side click handler (client components only). */
  onClick?: () => void
  /** Internal route to navigate to; renders the action as a link. */
  href?: string
}

export interface EmptyStateProps {
  /** Leading icon; defaults to a generic inbox icon. */
  icon?: LucideIcon
  title: string
  description?: string
  /** Optional primary action (button or link). */
  action?: EmptyStateAction
  /** Optional extra content rendered between the message and the action. */
  children?: ReactNode
  className?: string
}

/**
 * Centered empty/no-data placeholder with an icon, message and an
 * optional meaningful next action.
 */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon aria-hidden className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-balance text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            render={<Link href={action.href} />}
          >
            {action.label}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
      {children}
    </div>
  )
}
