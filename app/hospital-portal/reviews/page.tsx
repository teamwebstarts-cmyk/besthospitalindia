import type { Metadata } from "next"

import { ReviewResponseManager } from "@/features/hospital-portal/review-response-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoReviews } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/reviews — feedback & response status (pages/52).
 *
 * Server Component: passes the scoped review fixtures to the client manager.
 * Optional ?review= deep link from the dashboard queue.
 */

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "View demo patient reviews with moderation status and draft local partner responses. Reviews are read-only; replies never leave the demo (fictional data).",
}

interface HospitalPortalReviewsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HospitalPortalReviewsPage({
  searchParams,
}: HospitalPortalReviewsPageProps) {
  const params = await searchParams
  const rawReview = params.review
  const initialReviewKey = typeof rawReview === "string" ? rawReview : undefined

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Reviews"
        description="Read patient feedback for your facility and draft responses. Patient reviews cannot be edited; responses remain local drafts in the demo."
      />

      <ReviewResponseManager reviews={demoReviews()} initialReviewKey={initialReviewKey} />
    </div>
  )
}
