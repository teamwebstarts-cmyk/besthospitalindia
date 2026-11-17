import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** One benefit/eligibility bullet for a partner marketing page. */
export interface PartnerBenefit {
  id: string
  title: string
  description: string
  icon?: LucideIcon
}

export interface PartnerBenefitsProps {
  benefits: readonly PartnerBenefit[]
  className?: string
}

/**
 * Benefits grid for /for-hospitals and /for-doctors. Copy is passed in from
 * the page; no business promises are invented here.
 */
export function PartnerBenefits({ benefits, className }: PartnerBenefitsProps) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {benefits.map((benefit) => {
        const Icon = benefit.icon
        return (
          <li
            key={benefit.id}
            className="flex h-full gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
          >
            {Icon ? (
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon aria-hidden className="size-5 text-primary" />
              </span>
            ) : null}
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
