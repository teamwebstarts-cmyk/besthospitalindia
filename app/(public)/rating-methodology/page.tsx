import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { PageHeader, PageSection, ContentLinkGroup } from "@/features/content"
import { AnchorNav } from "@/features/content/anchor-nav"
import { RatingKindExplainer } from "@/features/content/rating-kind-explainer"
import { MethodologyCriteriaTable } from "@/features/content/methodology-criteria-table"
import { FaqList } from "@/features/content/faq-list"
import {
  methodologyAnchors,
  ratingKindEntries,
  cerCriteriaRows,
  merCriteriaRows,
  methodologyGovernance,
} from "@/features/content/home-content"
import { RATING_LABELS } from "@/constants/rating"
import { ratingAssessments } from "@/data"

export const metadata: Metadata = {
  title: "Rating Methodology",
  description:
    "How BestHospitalIndia produces its three independent ratings — PER (patient feedback), CER and MER (verified evidence) — including evidence sources, verification and governance.",
}

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Rating Methodology" },
]

/** Demo criterion rows per rating kind, keyed by methodology version from fixtures. */
function sampleCriteria(kind: "CER" | "MER") {
  const published = ratingAssessments.find(
    (assessment) =>
      assessment.ratingKind === kind && assessment.status === "published"
  )
  if (!published) return []
  return published.criteria.map((criterion) => ({
    id: criterion.id,
    label: criterion.label,
    weight: criterion.weight,
    sampleScore: criterion.score,
    scaleMax: criterion.scaleMax,
  }))
}

export default function RatingMethodologyPage() {
  const publishedCer = ratingAssessments.find(
    (assessment) =>
      assessment.ratingKind === "CER" && assessment.status === "published"
  )
  const publishedMer = ratingAssessments.find(
    (assessment) =>
      assessment.ratingKind === "MER" && assessment.status === "published"
  )

  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Rating Methodology"
        description="BestHospitalIndia maintains three independent rating categories. They are never combined, and a missing score is always shown as “Not yet rated” or “Assessment pending” — never as zero."
        breadcrumbItems={breadcrumbItems}
      />

      <AnchorNav items={methodologyAnchors} label="Jump to a rating type" />

      <PageSection
        title="Three independent ratings"
        description="Each rating kind answers a different question, using a different evidence base."
      >
        <RatingKindExplainer entries={ratingKindEntries} />
      </PageSection>

      <PageSection
        id="evidence"
        title="Evidence, sample size and metadata"
        description="Every published score is accompanied by the metadata needed to judge it."
      >
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Basis:</strong> PER is based on{" "}
            {RATING_LABELS.PER.toLowerCase()} batches (patient feedback); CER
            and MER are based on verified evidence such as accreditation
            records, audits, credential checks and outcome reports.
          </li>
          <li>
            <strong className="text-foreground">Sample size:</strong> the number
            of feedback responses or data points behind the score is always
            shown with the rating.
          </li>
          <li>
            <strong className="text-foreground">Last assessed date:</strong>{" "}
            when the assessment was last completed, so readers can judge
            freshness.
          </li>
          <li>
            <strong className="text-foreground">Methodology version:</strong>{" "}
            each score names the exact methodology version used (for example{" "}
            {publishedCer?.methodologyVersion ?? "METH-CER-1.1"} for CER and{" "}
            {publishedMer?.methodologyVersion ?? "METH-MER-1.0"} for MER).
          </li>
          <li>
            <strong className="text-foreground">Evidence summary:</strong> a
            short description of what the evidence pack for that assessment
            contained.
          </li>
        </ul>

        <div className="space-y-8 pt-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">CER</Badge>
              <h3 className="font-semibold text-foreground">
                Example criteria —{" "}
                {publishedCer?.methodologyVersion ?? "METH-CER-1.1"}
              </h3>
            </div>
            <MethodologyCriteriaTable
              caption="Clinical Expertise Rating criteria with demo weights and sample scores"
              rows={
                sampleCriteria("CER").length > 0
                  ? sampleCriteria("CER")
                  : cerCriteriaRows
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">MER</Badge>
              <h3 className="font-semibold text-foreground">
                Example criteria —{" "}
                {publishedMer?.methodologyVersion ?? "METH-MER-1.0"}
              </h3>
            </div>
            <MethodologyCriteriaTable
              caption="Medical Expertise Rating criteria with demo weights and sample scores"
              rows={
                sampleCriteria("MER").length > 0
                  ? sampleCriteria("MER")
                  : merCriteriaRows
              }
            />
          </div>

          <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
            PER is survey-based and does not use weighted criteria in the demo
            fixtures; its metadata (sample size, assessed date, methodology
            version) appears directly on hospital and doctor profiles. Note: PER
            is displayed alongside CER/MER but is a fully separate rating — the
            categories are never added, averaged or reconciled with each other.
          </p>
        </div>
      </PageSection>

      <PageSection
        id="governance"
        title="Governance and limitations"
        description="How assessments are reviewed, and what the ratings deliberately do not claim."
      >
        <ul className="list-disc space-y-2 pl-5">
          {methodologyGovernance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        links={[
          {
            label: "Browse hospitals with published PER/CER",
            href: "/hospitals",
          },
          { label: "Browse doctors with published PER/MER", href: "/doctors" },
          { label: "Medical disclaimer", href: "/disclaimer" },
          { label: "How It Works", href: "/how-it-works" },
        ]}
      />

      <section aria-label="Methodology FAQ" className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Methodology FAQ
        </h2>
        <FaqList
          faqs={[
            {
              id: "faq-meth-combine",
              question: "Why are PER, CER and MER shown separately?",
              answer:
                "Because they measure different things on different evidence bases. Combining them would hide what each number means, so the platform never computes a combined score.",
              category: "ratings",
              order: 1,
            },
            {
              id: "faq-meth-missing",
              question: "What does “Not yet rated” mean?",
              answer:
                "It means no approved score exists for that rating kind yet — the assessment may still be in review or has not started. It is never a zero-out-of-five score.",
              category: "ratings",
              order: 2,
            },
            {
              id: "faq-meth-version",
              question: "Why does every score mention a methodology version?",
              answer:
                "Ratings are produced per methodology version, so readers can tell which rule set produced a given score and how newer assessments differ from older ones.",
              category: "ratings",
              order: 3,
            },
          ]}
        />
      </section>
    </div>
  )
}
