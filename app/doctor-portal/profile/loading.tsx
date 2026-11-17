import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal/profile loading state — profile identity block + form fields.
 */
export default function DoctorProfileLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton variant="profile" className="max-w-4xl" />
    </div>
  )
}
