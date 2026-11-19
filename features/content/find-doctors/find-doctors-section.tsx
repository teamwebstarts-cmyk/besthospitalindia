"use client"

import type { Doctor } from "@/types"
import { ScrollReveal, StaggerReveal } from "@/components/motion/scroll-reveal"

import { FindDoctorCard } from "./find-doctor-card"

import "./find-doctors.css"

export interface FindDoctorsSectionProps {
  doctors: readonly Doctor[]
}

/**
 * "Find the Right Doctor" home band — badge + swash title + review-style
 * doctor cards, transcribed from the Find Doctors mock (fd-* classes).
 * Grid is 1 → 2 → 3 columns; cards stagger in on scroll (home band only).
 */
export function FindDoctorsSection({ doctors }: FindDoctorsSectionProps) {
  const highlightIndex = doctors.length > 1 ? Math.floor(doctors.length / 2) : -1

  return (
    <section
      id="home-featured-doctors"
      aria-labelledby="home-featured-doctors-heading"
      className="fd-section relative mr-[calc(50%-50vw)] ml-[calc(50%-50vw)] w-screen max-w-[100vw] border-b border-border/70"
    >
      <svg
        className="fd-blob fd-blob-br"
        viewBox="0 0 220 120"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M220 120C180 60 110 50 0 110V120Z" fill="#e6f4ef" />
      </svg>

      <div className="fd-content mx-auto w-full max-w-[min(1438px,calc(100%-24px))] px-4 sm:px-4">
        <ScrollReveal className="w-full">
          <h2 id="home-featured-doctors-heading" className="fd-title">
            Find the <span className="fd-title-green">Right Doctor</span>
          </h2>

          <p className="fd-sub">
            <span className="fd-sub-short">PER and MER stay separate - each with its own evidence.</span>
            <span className="fd-sub-full">
              Doctor cards show Patient Experience (PER) and Medical Expertise (MER) as two separate
              ratings with their own evidence metadata.
            </span>
          </p>
        </ScrollReveal>

        {doctors.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured doctors are available to show right now.
          </p>
        ) : (
          <StaggerReveal as="ul" className="fd-grid list-none p-0" staggerMs={56}>
            {doctors.map((doctor, index) => (
              <li key={doctor.id} className="flex min-h-0 min-w-0">
                <FindDoctorCard
                  doctor={doctor}
                  highlighted={index === highlightIndex}
                />
              </li>
            ))}
          </StaggerReveal>
        )}
      </div>
    </section>
  )
}
