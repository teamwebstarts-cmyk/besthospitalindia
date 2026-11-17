import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal/appointments loading state — toolbar + table geometry.
 */
export default function DoctorAppointmentsLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-9 w-56 animate-pulse rounded-md bg-muted" />
      <LoadingSkeleton variant="table" />
    </div>
  )
}
