import type { LucideIcon } from "lucide-react"

import { homeInteractiveSurfaceClassName } from "@/lib/home-motion"
import { cn } from "@/lib/utils"

/** One numbered journey step with an optional deep link. */
export interface JourneyStep {
  id: string
  title: string
  description: string
  icon?: LucideIcon
  /** Optional internal route the step links to (e.g. a directory or form). */
  href?: string
  /** Optional short link label; defaults to "Learn more". */
  hrefLabel?: string
}

export interface JourneyStepsProps {
  /** Steps in display order. */
  steps: readonly JourneyStep[]
  /** Render a numbered marker next to each step (default true). */
  numbered?: boolean
  className?: string
}

/**
 * Sequential step flow (discovery → enquiry → appointment → support), adapted
 * from the reference journey pattern. Steps stack on mobile, 2/4-up on larger
 * screens. Pure server component.
 */
export function JourneySteps({
  steps,
  numbered = true,
  className,
}: JourneyStepsProps) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <li
            key={step.id}
            className={cn(
              "flex h-full flex-col gap-2 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10",
              homeInteractiveSurfaceClassName
            )}
          >
            <div className="flex items-center gap-2">
              {numbered ? (
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {index + 1}
                </span>
              ) : null}
              {Icon ? (
                <Icon aria-hidden className="size-5 text-primary" />
              ) : null}
            </div>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
            {step.href ? (
              <a
                href={step.href}
                className="mt-1 inline-flex w-fit items-center gap-1 rounded text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {step.hrefLabel ?? "Learn more"}
                <span aria-hidden>→</span>
              </a>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
