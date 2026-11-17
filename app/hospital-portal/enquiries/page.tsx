import type { Metadata } from "next"

import { EnquiryQueueManager } from "@/features/hospital-portal/enquiry-queue-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoEnquiries, demoTeamMembers } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/enquiries — patient enquiries (pages/51).
 *
 * Server Component: passes the scoped enquiry queue + demo team list to the
 * client manager. Optional ?enquiry= deep link opens the detail drawer.
 */

export const metadata: Metadata = {
  title: "Enquiries",
  description:
    "Review demo patient enquiries with privacy-limited details, assign a demo internal owner and update local progress (fictional demo data).",
}

interface HospitalPortalEnquiriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HospitalPortalEnquiriesPage({
  searchParams,
}: HospitalPortalEnquiriesPageProps) {
  const params = await searchParams
  const rawEnquiry = params.enquiry
  const initialEnquiryKey = typeof rawEnquiry === "string" ? rawEnquiry : undefined

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Enquiries"
        description="Review patient enquiries routed to your facility and record local progress. Patient contact details remain masked in the demo; assignment is internal demo state only."
      />

      <EnquiryQueueManager
        enquiries={demoEnquiries()}
        teamMembers={demoTeamMembers().map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
        }))}
        initialEnquiryKey={initialEnquiryKey}
      />
    </div>
  )
}
