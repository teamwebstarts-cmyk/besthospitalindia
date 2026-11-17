import type { Metadata } from "next"

import { TeamManager } from "@/features/hospital-portal/team-manager"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { demoTeamMembers, getDemoPartnerUser } from "@/features/hospital-portal/demo-context"

/**
 * /hospital-portal/team — staff & RBAC demo list (pages/55).
 *
 * Server Component: passes fixture partner users of the demo hospital to the
 * client manager (invite placeholder, role change, revoke with confirm — all
 * local mock state).
 */

export const metadata: Metadata = {
  title: "Team",
  description:
    "View and manage the demo hospital's authorized staff list and roles. Invites are placeholders and role changes are local demo state — no emails or accounts are created (fictional demo data).",
}

export default function HospitalPortalTeamPage() {
  const currentUser = getDemoPartnerUser()

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Team"
        description="Manage the authorized staff list for the demo hospital. Invite, role and access actions update this demo's local state only — no real invites or account changes."
      />

      <TeamManager members={demoTeamMembers()} currentUserId={currentUser.id} />
    </div>
  )
}
