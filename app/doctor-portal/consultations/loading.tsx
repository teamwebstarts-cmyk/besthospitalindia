import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * /doctor-portal/consultations loading state — two-column case-card grid.
 */
export default function DoctorConsultationsLoading() {
  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton variant="card" count={2} />
    </div>
  )
}
