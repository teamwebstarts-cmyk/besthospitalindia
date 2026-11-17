import type { Metadata } from "next"

import { PageHeader, PageSection, ContentLinkGroup } from "@/features/content"
import { aboutContent } from "@/features/content/home-content"

export const metadata: Metadata = {
  title: "About Us",
  description:
    "BestHospitalIndia is a healthcare discovery platform for hospitals, doctors and facilities across India — built on structured discovery, independent ratings and visible verification states.",
}

const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "About Us" }]

export default function AboutPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="About BestHospitalIndia"
        description="What the platform does, how it presents providers and ratings, and the trust principles behind the demo build."
        breadcrumbItems={breadcrumbItems}
      />

      <PageSection title="Our mission" description="Why this platform exists.">
        <p>{aboutContent.mission}</p>
      </PageSection>

      <PageSection
        title="Our vision"
        description="What transparent healthcare discovery looks like."
      >
        <p>{aboutContent.vision}</p>
      </PageSection>

      <PageSection
        title="Objectives"
        description="The concrete goals that shape every page, workflow and rating surface on the platform."
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {aboutContent.objectives.map((objective) => (
            <li
              key={objective.id}
              className="rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
            >
              <h3 className="font-semibold text-foreground">
                {objective.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {objective.body}
              </p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        title="Platform scope"
        description="What BestHospitalIndia covers in this demo build."
      >
        <ul className="list-disc space-y-2 pl-5">
          {aboutContent.scope.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        title="Trust principles"
        description="Non-negotiable presentation rules applied across the platform."
      >
        <ul className="list-disc space-y-2 pl-5">
          {aboutContent.trustPrinciples.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        description="Go deeper into how the platform works and how ratings are produced."
        links={[
          {
            label: "How It Works — patient and partner flows",
            href: "/how-it-works",
          },
          {
            label: "Rating Methodology — PER, CER and MER",
            href: "/rating-methodology",
          },
          {
            label: "International Urban Forum",
            href: "/international-urban-forum",
          },
          { label: "Contact the platform team", href: "/contact" },
        ]}
      />
    </div>
  )
}
