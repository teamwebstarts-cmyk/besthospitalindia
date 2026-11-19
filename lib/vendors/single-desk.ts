import { assignOpenLeads } from "@/lib/leads/store"
import type { LeadCity } from "@/lib/leads/types"

import { listVendors, updateVendor } from "@/lib/vendors/store"

/** The active desk for a city is the one that receives new queries. */
export async function ensureSingleActiveDesk(city: LeadCity, keepId: string) {
  const vendors = await listVendors()
  const extras = vendors.filter((vendor) => vendor.city === city && vendor.id !== keepId && vendor.active)
  for (const vendor of extras) {
    await updateVendor(vendor.id, { active: false })
  }
  await assignOpenLeads(city, keepId)
}
