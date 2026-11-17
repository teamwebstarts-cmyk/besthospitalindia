import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/**
 * Hospital-portal segment loading fallback: header block + KPI grid + table
 * skeleton approximating portal page geometry.
 */
export default function HospitalPortalLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <LoadingSkeleton variant="table" />
    </div>
  )
}
