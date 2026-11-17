import type { Metadata } from "next"

import { PortalPageHeader } from "@/features/doctor-portal/components/portal-page-header"
import { ReviewsClient } from "@/features/doctor-portal/components/reviews-client"
import { reviewsForDoctor } from "@/features/doctor-portal/selectors"
import { getSessionDoctor } from "@/features/doctor-portal/session"

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "View patient feedback for the demo doctor profile and draft permitted responses. Reviews are read-only; drafts are never published.",
}

/**
 * /doctor-portal/reviews — Patient Reviews (pages/64).
 *
 * Server Component resolves the doctor's review fixtures + PER summary; the
 * client island owns the filter, the reply-draft composer and moderation-aware
 * reply gating. Acceptances honored: no rating manipulation (PER renders
 * read-only from the fixture; review stars never touch it), patient content is
 * never editable, replies only on published reviews without an existing reply.
 */
export default function DoctorReviewsPage() {
  const doctor = getSessionDoctor()
  const reviews = doctor ? reviewsForDoctor(doctor.id) : []

  return (
    <div className="space-y-6 py-8">
      <PortalPageHeader
        items={[
          { label: "Doctor Portal", href: "/doctor-portal" },
          { label: "Reviews" },
        ]}
        title="Patient reviews"
        description="Feedback patients left on your demo profile, with response drafts where the platform permits a reply. Patient review text can never be edited or removed here."
      />

      {doctor ? (
        <ReviewsClient
          reviews={reviews}
          per={doctor.ratings.per}
          doctorName={doctor.name}
        />
      ) : (
        <p role="alert" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Demo profile fixture could not be resolved. The portal session identity is missing
          from the demo data.
        </p>
      )}
    </div>
  )
}
