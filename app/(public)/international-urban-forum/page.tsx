import type { Metadata } from "next"
import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader, PageSection, ContentLinkGroup } from "@/features/content"
import { iufContent } from "@/features/content/home-content"

export const metadata: Metadata = {
  title: "International Urban Forum",
  description:
    "Background of the International Urban Forum (IUF) and its relationship to the IUF-supported free consultation initiative on BestHospitalIndia.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "International Urban Forum" },
]

export default function InternationalUrbanForumPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="International Urban Forum (IUF)"
        description={iufContent.intro}
        breadcrumbItems={breadcrumbItems}
      >
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <SparklesIcon aria-hidden className="size-3.5" />
          {iufContent.banner}
        </p>
      </PageHeader>

      <PageSection
        title="Institutional background"
        description="What is documented about IUF’s role on this platform."
      >
        <ul className="list-disc space-y-2 pl-5">
          {iufContent.background.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <PageSection
        title="Relationship to the consultation initiative"
        description="Where the IUF identity appears, and where it deliberately does not."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {iufContent.relationship.map((item) => (
            <article
              key={item.id}
              className="flex h-full flex-col gap-2 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
            >
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              {"href" in item && item.href ? (
                <Button
                  variant="link"
                  className="h-auto w-fit px-0"
                  render={<Link href={item.href} />}
                >
                  {item.hrefLabel} →
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      </PageSection>

      <Alert>
        <AlertTitle>IUF content approval pending</AlertTitle>
        <AlertDescription>
          Institutional details, approvals and branding assets on this page are
          maintained in coordination with IUF. No affiliation, endorsement or legal
          status is claimed beyond what IUF has approved for publication.
        </AlertDescription>
      </Alert>

      <ContentLinkGroup
        title="Supporting links"
        links={[
          {
            label: "Free consultation (IUF-supported initiative)",
            href: "/free-consultation",
          },
          { label: "About BestHospitalIndia", href: "/about" },
          { label: "How It Works", href: "/how-it-works" },
          { label: "Contact", href: "/contact" },
        ]}
      />
    </div>
  )
}
