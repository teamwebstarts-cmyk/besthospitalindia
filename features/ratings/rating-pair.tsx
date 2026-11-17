/**
 * RatingPair — two visually distinct, independent rating panels (Agent A04).
 *
 * Contract sources:
 * - implementation/08-component-catalog.md — "Two independent rating panels; no
 *   combined value".
 * - implementation/05-design-system.md "Rating visual rules" — PER and
 *   CER/MER live in separate modules/columns; never a combined star row,
 *   average or "overall rating".
 *
 * Hospitals pass `per` + `cer`; doctors pass `per` + `mer`. Exactly two kinds
 * render — one per column/grid cell — and no combined or averaged value is
 * ever computed or displayed. Each column renders a full RatingPanel carrying
 * its own evidence metadata.
 */

import { RatingPanel } from "@/features/ratings/rating-panel"
import { cn } from "@/lib/utils"
import type { RatingSummary } from "@/types"

export interface RatingPairProps {
  /** Patient Experience Rating — always present. */
  per: RatingSummary
  /** Clinical Expertise Rating (hospital profiles). */
  cer?: RatingSummary
  /** Medical Expertise Rating (doctor profiles). */
  mer?: RatingSummary
  /** Heading level forwarded to both panels. */
  headingLevel?: "h2" | "h3" | "h4"
  /** Show evidence metadata on both panels. Defaults to true. */
  showEvidence?: boolean
  /** Screen-reader intro clarifying that the two ratings are independent. */
  srLead?: string
  className?: string
}

export function RatingPair({ per, cer, mer, headingLevel, showEvidence = true, srLead, className }: RatingPairProps) {
  // Hospitals carry per+cer; doctors carry per+mer. Never both experts at once.
  const expert = cer ?? mer
  const pairLabel = cer ? "experience and clinical expertise ratings" : "experience and medical expertise ratings"

  return (
    <section
      aria-label={srLead ?? `Independent ${pairLabel} — shown separately, never combined`}
      data-slot="rating-pair"
      className={cn("grid gap-4 md:grid-cols-2", className)}
    >
      <RatingPanel rating={per} headingLevel={headingLevel} showEvidence={showEvidence} />
      {expert ? <RatingPanel rating={expert} headingLevel={headingLevel} showEvidence={showEvidence} /> : null}
    </section>
  )
}
