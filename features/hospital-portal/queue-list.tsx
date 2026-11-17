/**
 * QueueList — dashboard action queue (Agent A09 local composition).
 *
 * Catalog name: `QueueList` (pages/46 lists it; no shared implementation
 * exists yet — shared-component request logged in the A09 report).
 *
 * A compact list of items needing partner action, each with title, meta line,
 * status badge and one action. Rendered as a real list (ul/li) with the
 * action inside the item, so keyboard order stays logical.
 */

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { StatusValue } from "@/components/shared/status-badge"

export interface QueueItem {
  /** Stable item id. */
  id: string
  /** Primary line, e.g. patient/enquiry label. */
  title: string
  /** Supporting line, e.g. specialty + date. */
  meta?: string
  /** Status value rendered through the shared StatusBadge. */
  status: StatusValue
  /** Optional status display label override. */
  statusLabel?: string
  /** Target route for the action ("View"). */
  href: string
  /** Screen-reader context appended to the action label. */
  actionLabel?: string
}

export interface QueueListProps {
  /** Queue heading. */
  title: string
  items: QueueItem[]
  /** Message rendered when the queue is empty. */
  emptyTitle: string
  emptyDescription?: string
  /** Count shown next to the heading. */
  className?: string
}

export function QueueList({
  title,
  items,
  emptyTitle,
  emptyDescription,
  className,
}: QueueListProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b [.border-b]:pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {items.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="gap-0 px-0 py-0">
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              className="border-none py-8"
            />
          </div>
        ) : (
          <ul className="divide-y" aria-label={title}>
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 px-(--card-spacing) py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  {item.meta ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.meta}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <StatusBadge status={item.status} label={item.statusLabel} />
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.actionLabel ?? "View"}
                    <ArrowRightIcon aria-hidden className="size-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
