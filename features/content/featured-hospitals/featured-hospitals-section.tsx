"use client"

import type { Hospital } from "@/types"
import { ScrollReveal, StaggerReveal } from "@/components/motion/scroll-reveal"

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

      <div className="fh-content mx-auto w-full max-w-[min(1438px,calc(100%-24px))] px-4 sm:px-4">
        <ScrollReveal className="w-full">
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

          <p className="mx-auto mt-2 max-w-2xl text-pretty text-center text-sm leading-relaxed text-muted-foreground sm:mt-2.5 sm:text-base">
            <span className="sm:hidden">
              PER and CER shown separately — never a combined score.
            </span>
            <span className="hidden sm:inline">
              Each card shows independent Patient Experience (PER) and Clinical Expertise (CER)
              ratings — never a combined score.
            </span>
          </p>
        </ScrollReveal>

        {hospitals.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No featured hospitals are available to show right now.
          </p>
        ) : (
          <StaggerReveal as="ul" className="fh-grid list-none p-0" staggerMs={56}>
            {hospitals.map((hospital) => (
              <li key={hospital.id} className="flex min-h-0 min-w-0">
                <FeaturedHospitalCard hospital={hospital} />
              </li>
            ))}
          </StaggerReveal>
        )}
      </div>
    </section>
  )
}