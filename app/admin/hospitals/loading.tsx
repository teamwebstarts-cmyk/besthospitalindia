import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/** /admin/hospitals loading state — toolbar + table geometry. */
export default function AdminHospitalsLoading() {
  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <LoadingSkeleton variant="card" count={1} className="grid-cols-1 flex-1" />
      </div>
      <LoadingSkeleton variant="table" />
    </div>
  )
}
