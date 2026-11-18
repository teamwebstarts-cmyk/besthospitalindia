import Image from "next/image"
import { StarIcon } from "lucide-react"

import { hospitalById } from "@/data"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/types"

export interface TestimonialsMarqueeProps {
  testimonials: readonly Testimonial[]
  className?: string
}

function GoogleStyleReviewCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial
  className?: string
}) {
  const hospital = testimonial.hospitalId ? hospitalById[testimonial.hospitalId] : undefined
  const rating = testimonial.rating ?? 5
  const photo = testimonial.authorPhoto ?? `https://i.pravatar.cc/96?u=${testimonial.id}`

  return (
    <figure
      className={cn(
        "flex w-[min(calc(100vw-2rem),20rem)] shrink-0 flex-col gap-3 rounded-lg border border-border/70 bg-card p-4 text-left sm:w-[22rem]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
          <Image src={photo} alt="" fill sizes="40px" className="object-cover" unoptimized />
        </div>
        <div className="min-w-0 flex-1">
          <figcaption className="truncate text-sm font-semibold text-foreground">
            {testimonial.authorName}
          </figcaption>
          <p className="text-xs text-muted-foreground">
            {testimonial.authorCountry}
            {testimonial.relativeTime ? ` · ${testimonial.relativeTime}` : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            aria-hidden
            className={cn(
              "size-3.5",
              i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
            )}
          />
        ))}
      </div>

      <blockquote className="line-clamp-4 text-sm leading-relaxed text-foreground/90">
        {testimonial.quote}
      </blockquote>

      {hospital ? (
        <p className="truncate text-xs text-muted-foreground">
          Visited <span className="font-medium text-foreground/80">{hospital.name}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Platform discovery · demo patient story</p>
      )}
    </figure>
  )
}

/** Horizontal review strip — Google-review inspired, auto-marquee (demo stories). */
export function TestimonialsMarquee({ testimonials, className }: TestimonialsMarqueeProps) {
  if (testimonials.length === 0) return null

  const looped = [...testimonials, ...testimonials]

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-background to-transparent sm:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-background to-transparent sm:w-16"
        aria-hidden
      />

      <div className="overflow-hidden py-1">
        <div className="home-testimonials-marquee flex w-max gap-4 pr-4">
          {looped.map((testimonial, index) => (
            <GoogleStyleReviewCard
              key={`${testimonial.id}-${index}`}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </div>
  )
}