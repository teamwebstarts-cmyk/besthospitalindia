import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal loading state — matches the dashboard geometry (KPI grid +
 * two-column content) so the shell swap doesn't jump.
 */
export default function DoctorPortalLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-72 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-64 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton variant="card" count={4} className="sm:grid-cols-2 xl:grid-cols-4" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoadingSkeleton variant="table" />
        </div>
        <LoadingSkeleton variant="profile" />
      </div>
    </div>
  )
}
