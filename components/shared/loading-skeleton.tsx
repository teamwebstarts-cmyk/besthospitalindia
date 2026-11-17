import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type SkeletonPreset = "card" | "table" | "profile"

export interface LoadingSkeletonProps {
  /** Geometry preset approximating the final component. */
  variant?: SkeletonPreset
  /** Number of repeated blocks (cards, rows or profile blocks). */
  count?: number
  className?: string
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-surface p-4">
      <Skeleton className="h-40 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
        >
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <Skeleton key={cellIndex} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-lg border bg-surface p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/**
 * Geometry-aware loading placeholder.
 * `card` renders a responsive grid of card skeletons, `table` a header +
 * rows skeleton, `profile` an identity block skeleton.
 */
export function LoadingSkeleton({
  variant = "card",
  count = 6,
  className,
}: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("w-full", className)} aria-busy="true" aria-live="polite">
        <TableSkeleton />
      </div>
    )
  }

  if (variant === "profile") {
    return (
      <div className={cn("w-full", className)} aria-busy="true" aria-live="polite">
        <ProfileSkeleton />
      </div>
    )
  }

  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}
