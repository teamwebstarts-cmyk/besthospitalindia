import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal/settings loading state — preference card + side cards.
 */
export default function DoctorSettingsLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LoadingSkeleton variant="table" />
        </div>
        <div className="space-y-6">
          <LoadingSkeleton variant="profile" />
        </div>
      </div>
    </div>
  )
}
