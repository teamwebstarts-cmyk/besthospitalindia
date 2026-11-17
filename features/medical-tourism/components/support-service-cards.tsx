/**
 * SupportServiceCards — informational support-service grid (Agent A06).
 *
 * Contract source: implementation/08-component-catalog.md ("SupportServiceCards")
 * + 13-travel-assistance.md. Services are informational only: the caller
 * supplies neutral copy with explicit availability caveats; this component
 * renders no booking, scheduling or guaranteed-service affordance.
 */

import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SupportService {
  /** Short service name, e.g. "Accommodation guidance". */
  title: string
  /** Neutral description of what information the platform provides. */
  description: string
  /** Explicit caveat, e.g. availability or demo-scope limits. */
  caveat?: string
  icon?: LucideIcon
}

export interface SupportServiceCardsProps {
  services: readonly SupportService[]
  /** Grid density: 2 or 3 columns at large breakpoints. */
  columns?: 2 | 3
  className?: string
}

export function SupportServiceCards({
  services,
  columns = 3,
  className,
}: SupportServiceCardsProps) {
  return (
    <ul
      className={cn(
        "grid gap-4",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        className
      )}
    >
      {services.map((service) => {
        const Icon = service.icon
        return (
          <li key={service.title}>
            <Card size="sm" className="h-full">
              <CardHeader>
                {Icon ? (
                  <span
                    aria-hidden
                    className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <Icon className="size-4.5" />
                  </span>
                ) : null}
                <CardTitle className="text-base leading-snug font-semibold">
                  {service.title}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              {service.caveat ? (
                <CardContent>
                  <p className="text-xs text-muted-foreground">{service.caveat}</p>
                </CardContent>
              ) : null}
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
