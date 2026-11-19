import type { Metadata } from "next"

import { listLeads } from "@/lib/leads/store"
import { getVendorSessionId } from "@/lib/vendors/session"
import { getVendor } from "@/lib/vendors/store"
import { VendorDesk } from "@/features/vendors/vendor-desk"
import { VendorLogin } from "@/features/vendors/vendor-login"

export const metadata: Metadata = {
  title: "City desk",
  description: "Vendor view of patient queries for one city.",
}

export const dynamic = "force-dynamic"

export default async function VendorPage() {
  const vendorId = await getVendorSessionId()
  const vendor = vendorId ? await getVendor(vendorId) : null
  if (!vendor || !vendor.active) {
    return <VendorLogin />
  }
  const leads = (await listLeads()).filter((lead) => lead.vendorId === vendor.id)
  return <VendorDesk vendor={vendor} initialLeads={leads} />
}
