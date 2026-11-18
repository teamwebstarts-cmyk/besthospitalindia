import type { Hospital } from "@/types"

import { FeaturedHospitalCard } from "./featured-hospital-card"

import "./featured-hospitals.css"

export interface FeaturedHospitalsSectionProps {
  hospitals: readonly Hospital[]
}

export function FeaturedHospitalsSection({ hospitals }: FeaturedHospitalsSectionProps) {
  return (
    <section
      id="home-featured-hospitals"
      aria-labelledby="home-featured-hospitals-heading"
      className="fh-section relative mr-[calc(50%-50vw)] ml-[calc(50%-50vw)] w-screen max-w-[100vw] border-b border-border/70"
    >
      <svg className="fh-blob fh-blob-tl" viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0H290C275 85 160 150 0 218Z" fill="#dff3ec" />
      </svg>
      <svg className="fh-blob fh-blob-r" viewBox="0 0 260 190" preserveAspectRatio="none" aria-hidden>
        <path d="M260 0C200 40 150 110 0 190H260Z" fill="#eaf6f1" />
      </svg>
      <svg className="fh-blob fh-blob-bl" viewBox="0 0 470 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0C60 10 100 50 190 80C260 100 400 105 470 120H0Z" fill="#e4f4ee" />
      </svg>

      <div className="fh-content mx-auto w-full max-w-[min(1438px,calc(100%-24px))] px-3 sm:px-4">
        <h2 id="home-featured-hospitals-heading" className="fh-title">
          Featured Hospitals
          <svg
            className="fh-title-swash"
            viewBox="0 0 160 14"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M2 9C30 3 90 2 158 7"
              fill="none"
              stroke="#bfe6d6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </h2>

        <p className="fh-sub">
          Each card shows independent Patient Experience (PER) and Clinical Expertise (CER) ratings
          — never a combined score.
        </p>

        {hospitals.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured hospitals are available to show right now.
          </p>
        ) : (
          <div className="fh-grid">
            {hospitals.map((hospital) => (
              <FeaturedHospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}