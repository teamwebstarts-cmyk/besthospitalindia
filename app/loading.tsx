import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * Route-level loading fallback: a responsive grid of card skeletons
 * matching listing-page geometry.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton variant="card" count={6} />
    </div>
  )
}
