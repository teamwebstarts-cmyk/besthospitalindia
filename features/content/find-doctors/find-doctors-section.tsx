import type { Doctor } from "@/types"

import { FindDoctorCard } from "./find-doctor-card"

import "./find-doctors.css"

export interface FindDoctorsSectionProps {
  doctors: readonly Doctor[]
}

/**
 * "Find the Right Doctor" home band — badge + swash title + review-style
 * doctor cards, transcribed from the Find Doctors mock (fd-* classes).
 * Grid collapses to a single 560px column at the mock's 1150px breakpoint.
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

      <div className="fd-content mx-auto w-full max-w-[min(1438px,calc(100%-24px))] px-3 sm:px-4">
        <h2 id="home-featured-doctors-heading" className="fd-title">
          Find the{" "}
          <span className="fd-title-wrap">
            <span className="fd-title-green">Right Doctor</span>
            <svg
              className="fd-title-swash"
              viewBox="0 0 300 14"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M5 10C80 3 200 2 295 8"
                fill="none"
                stroke="#0a9d7a"
                strokeWidth={4}
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h2>

        <p className="fd-sub">
          Doctor cards show Patient Experience (PER) and Medical Expertise (MER) as two separate
          ratings with their own evidence metadata.
        </p>

        {doctors.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured doctors are available to show right now.
          </p>
        ) : (
          <div className="fd-grid">
            {doctors.map((doctor, index) => (
              <FindDoctorCard
                key={doctor.id}
                doctor={doctor}
                highlighted={index === highlightIndex}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
