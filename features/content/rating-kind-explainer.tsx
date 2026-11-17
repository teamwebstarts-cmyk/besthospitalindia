import { cn } from "@/lib/utils"

/** One PER/CER/MER definition block passed in from the methodology page. */
export interface RatingKindEntry {
  /** e.g. 'PER' — rendered as the visual anchor. */
  kind: string
  /** Full display label from RATING_LABELS, e.g. 'Patient Experience Rating'. */
  label: string
  /** Plain-language definition (spec text, no invented rules). */
  description: string
  /** What the rating is based on (e.g. patient feedback / verified evidence). */
  basis: string
  /** Concrete example fields shown on provider profiles. */
  meta: readonly string[]
  /** Anchor id of this block on the page. */
  anchorId: string
}

export interface RatingKindExplainerProps {
  entries: readonly RatingKindEntry[]
  className?: string
}

/**
 * Three-card explainer for the independent PER / CER / MER rating kinds.
 * Reinforces that the categories are separate and never combined into one
 * score — a platform-wide presentation rule, not an invented business rule.
 */
export function RatingKindExplainer({
  entries,
  className,
}: RatingKindExplainerProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", className)}>
      {entries.map((entry) => (
        <article
          key={entry.kind}
          id={entry.anchorId}
          className="flex h-full scroll-mt-24 flex-col gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-flex h-7 items-center rounded-md bg-primary/10 px-2 text-xs font-bold tracking-wide text-primary"
            >
              {entry.kind}
            </span>
            <h3 className="font-semibold text-foreground">{entry.label}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Based on:</span>{" "}
            {entry.basis}
          </p>
          <ul className="mt-auto space-y-1 border-t pt-3 text-xs text-muted-foreground">
            {entry.meta.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
