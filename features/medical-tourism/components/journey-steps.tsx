/**
 * JourneySteps — numbered international-patient journey (Agent A06).
 *
 * Contract source: implementation/08-component-catalog.md + 09-medical-tourism.md
 * ("JourneySteps"). Purely presentational: the caller supplies typed steps;
 * nothing here simulates a backend step. Travel stages are labeled as
 * informational only — no guaranteed coordination is claimed.
 */

import { cn } from "@/lib/utils"

export interface JourneyStep {
  /** Short step label, e.g. "Share your case". */
  title: string
  /** One or two neutral sentences describing the step. */
  description: string
}

export interface JourneyStepsProps {
  steps: readonly JourneyStep[]
  /** Accessible heading level for each step title. */
  as?: "h3" | "h4"
  /** Extra note rendered under the list (e.g. demo-scope notice). */
  footnote?: string
  className?: string
}

export function JourneySteps({
  steps,
  as: Tag = "h3",
  footnote,
  className,
}: JourneyStepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs"
          >
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
              {index + 1}
            </span>
            <Tag className="text-base leading-snug font-semibold text-foreground">
              {step.title}
            </Tag>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      {footnote ? (
        <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>
      ) : null}
    </div>
  )
}
