"use client"

import type { JourneyStepsProps } from "@/features/content/journey-steps"
import { homeInteractiveSurfaceClassName } from "@/lib/home-motion"
import { StaggerReveal } from "@/components/motion/scroll-reveal"
import { cn } from "@/lib/utils"

/** Journey steps with soft scroll-in stagger on the home page. */
export function JourneyStepsAnimated({ className, ...props }: JourneyStepsProps) {
  return (
    <StaggerReveal
      as="ol"
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      staggerMs={85}
    >
      {props.steps.map((step, index) => {
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
              {props.numbered !== false ? (
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {index + 1}
                </span>
              ) : null}
              {Icon ? <Icon aria-hidden className="size-5 text-primary" /> : null}
            </div>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            {step.href ? (
              <a
                href={step.href}
                className="mt-1 inline-flex w-fit items-center gap-1 rounded text-sm font-medium text-primary underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {step.hrefLabel ?? "Learn more"}
                <span aria-hidden>→</span>
              </a>
            ) : null}
          </li>
        )
      })}
    </StaggerReveal>
  )
}