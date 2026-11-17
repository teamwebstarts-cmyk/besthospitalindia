import type { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import type { RatingAssessment } from "@/types"
import { RatingPair } from "@/features/ratings/rating-pair"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { EvidenceSubmitMock } from "@/features/hospital-portal/evidence-submit-mock"
import { demoAssessments, getDemoHospital } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/ratings — PER/CER information, evidence and assessment
 * status (pages/54).
 *
 * Trust-model rules enforced here (00-project-analysis + 09 contract):
 * - PER and CER render as two INDEPENDENT RatingPanels via the shared
 *   RatingPair — never combined, never averaged, no self-awarded score.
 * - Null scores render the shared "Not yet rated" / "Assessment pending"
 *   messages — never 0/5.
 * - Assessment criteria/evidence come from the frozen ratingAssessment
 *   fixtures; the partner can view details and submit a demo evidence
 *   placeholder, but no publish/self-score control exists anywhere.
 */

export const metadata: Metadata = {
  title: "Ratings",
  description:
    "View the demo hospital's independent Patient Experience (PER) and Clinical Expertise (CER) ratings with assessment status and evidence metadata. Scores are admin-assessed; partners cannot publish or change them (fictional demo data).",
}

export default function HospitalPortalRatingsPage() {
  const hospital = getDemoHospital()
  const assessments = demoAssessments()

  const perAssessment = assessments.find((assessment) => assessment.ratingKind === "PER")
  const cerAssessments = assessments.filter((assessment) => assessment.ratingKind === "CER")

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Ratings"
        description="Your Patient Experience Rating (PER) and Clinical Expertise Rating (CER) are independent ratings assessed by the platform from patient feedback and verified evidence. Partners cannot publish, edit or combine these scores."
      />

      <section aria-label="Independent ratings">
        <RatingPair per={hospital.ratings.per} cer={hospital.ratings.cer} headingLevel="h2" />
      </section>

      <section aria-label="Assessment records" className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Assessment records (demo)
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-balance text-muted-foreground">
            One assessment covers one rating kind and one methodology version. Criteria scores and
            evidence are demo metadata from the frozen fixtures.
          </p>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="gap-2">
              <p className="font-medium text-foreground">No assessment records yet</p>
              <p className="text-sm text-muted-foreground">
                The demo workflow has not scheduled an assessment for this hospital. Ratings stay
                “Not yet rated” until an admin assessment is approved and published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {perAssessment ? (
              <AssessmentCard assessment={perAssessment} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>PER assessment</CardTitle>
                  <CardDescription>No PER assessment record exists in the demo set.</CardDescription>
                </CardHeader>
              </Card>
            )}
            {cerAssessments.length > 0 ? (
              cerAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>CER assessment</CardTitle>
                  <CardDescription>No CER assessment record exists in the demo set.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </section>

      <EvidenceSubmitMock hospitalId={hospital.id} />
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: RatingAssessment }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            {assessment.ratingKind} assessment · {assessment.methodologyVersion}
          </CardTitle>
          <StatusBadge status={assessment.status} />
        </div>
        <CardDescription>
          Assessed by {assessment.assessedBy} on {assessment.assessedAt}
          {assessment.publishedAt ? ` · published ${assessment.publishedAt}` : " · not published"}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Criteria
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (null = not yet scored, never 0)
            </span>
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {assessment.criteria.map((criterion) => (
              <li
                key={criterion.id}
                className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-foreground">{criterion.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    weight {criterion.weight}%
                    {criterion.notes ? ` · ${criterion.notes}` : ""}
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  {criterion.score === null ? (
                    <span className="text-muted-foreground">Not yet scored</span>
                  ) : (
                    `${criterion.score}/${criterion.scaleMax}`
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Evidence ({assessment.evidence.length})
          </p>
          {assessment.evidence.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted-foreground">
              No evidence collected yet in the demo workflow.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {assessment.evidence.map((evidence) => (
                <li key={evidence.id} className="rounded-md border bg-muted/40 px-3 py-2">
                  <p className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{evidence.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {evidence.kind.replace(/_/g, " ")} · collected {evidence.collectedAt}
                    </span>
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{evidence.summary}</p>
                  {evidence.referenceLabel ? (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      ref: {evidence.referenceLabel}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {assessment.notes ? (
          <p className="rounded-md border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
            {assessment.notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
