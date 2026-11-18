import { QuoteIcon } from "lucide-react"

import type { Testimonial } from "@/types"
import { cn } from "@/lib/utils"

export interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
}

/**
 * One fictional patient-story card. Always labelled as a fictional demo
 * fixture — never presented as a real patient statement.
 */
export function TestimonialCard({
  testimonial,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "interactive-surface flex h-full flex-col gap-3 rounded-xl bg-card p-5 text-sm shadow-xs ring-1 ring-foreground/10",
        className
      )}
    >
      <QuoteIcon aria-hidden className="size-5 text-primary/60" />
      <blockquote className="flex-1 leading-relaxed text-pretty text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="space-y-1 border-t pt-3 text-muted-foreground">
        <span className="block font-medium text-foreground">
          {testimonial.authorName} · {testimonial.authorCountry}
        </span>
        <span className="block text-xs">Patient experience shared on the platform.</span>
      </figcaption>
    </figure>
  )
}
