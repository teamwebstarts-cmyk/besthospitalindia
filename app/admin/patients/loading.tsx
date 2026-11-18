import { LoadingSkeleton } from "@/components/shared/loading-skeleton"

/** /admin/patients loading state — notice card + toolbar + table geometry. */
export default function AdminPatientsLoading() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>
      <LoadingSkeleton variant="card" count={1} className="grid-cols-1" />
      <LoadingSkeleton variant="table" />
    </div>
  )
}
