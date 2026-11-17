import { cn } from "@/lib/utils"

/** One demo criterion row (label, weight, sample score) for a rating kind. */
export interface MethodologyCriteriaRow {
  id: string
  label: string
  /** Relative weight as a percentage (demo metadata). */
  weight: number
  /** Sample score from a published demo assessment, or null when not scored. */
  sampleScore: number | null
  scaleMax: number
}

export interface MethodologyCriteriaTableProps {
  /** Visible caption, e.g. "Criteria shown with demo values". */
  caption: string
  rows: readonly MethodologyCriteriaRow[]
  className?: string
}

function formatScore(score: number | null, scaleMax: number): string {
  if (score === null) return "Not yet rated"
  return `${score} / ${scaleMax}`
}

/**
 * Scroll-safe criteria table for the methodology page. Deliberate local
 * horizontal scroll container with a visible affordance on narrow screens
 * (per the page spec: tables stay readable at 360px without page overflow).
 * Weights are demo metadata copied from frozen fixtures — no invented weight
 * scheme is presented as policy.
 */
export function MethodologyCriteriaTable({
  caption,
  rows,
  className,
}: MethodologyCriteriaTableProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-x-auto rounded-xl border shadow-xs">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Criterion
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Demo weight
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Sample published score
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-medium text-foreground"
                >
                  {row.label}
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.weight}%
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatScore(row.sampleScore, row.scaleMax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Scroll horizontally to see all columns on small screens. Weights and
        scores above are fictional demo values copied from the mock assessment
        fixtures — they illustrate the metadata shown with each rating and are
        not a published weighting policy.
      </p>
    </div>
  )
}
