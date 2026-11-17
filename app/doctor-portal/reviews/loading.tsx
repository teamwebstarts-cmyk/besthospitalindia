import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal/reviews loading state — PER context card + review list.
 */
export default function DoctorReviewsLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-28 w-full max-w-2xl animate-pulse rounded-lg bg-muted" />
      <LoadingSkeleton variant="card" count={2} />
    </div>
  )
}
