import type { Metadata } from "next"

import { partnerUsers } from "@/data"
import { AdminPageHeader } from "@/features/admin"
import { PartnerAccountsManager } from "@/features/admin/components/partner-accounts-manager"

/**
 * /admin/partners — Partner Management (pages/24 + 14-admin-module-contracts).
 *
 * Server Component: passes the frozen PartnerUser fixtures to the client
 * island. Organizations come from the linked Hospital fixtures; the demo
 * contract defines exactly three partner accounts across two organizations
 * plus the doctor-side coordinator desk — no extra organizations invented.
 */

export const metadata: Metadata = {
  title: "Partner Management",
  description:
    "Admin partner management (demo): review hospital and service-provider partner accounts with local mock approve / suspend actions and a staff view. Fictional fixture data only.",
}

export default function AdminPartnersPage() {
  return (
    <div className="space-y-8 py-8">
      <AdminPageHeader
        items={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Partners" },
        ]}
        title="Partner management"
        description="Review organizations with partner access and their staff accounts. Approve / suspend record a local demo access flag; the staff view explains the demo roster boundary. All actions are local demo state."
      />

      <PartnerAccountsManager partnerUsers={partnerUsers} />
    </div>
  )
}
