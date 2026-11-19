import { NextResponse } from "next/server"

import { listLeads, updateLeadStatus } from "@/lib/leads/store"
import type { LeadStatus } from "@/lib/leads/types"
import { getVendorSessionId } from "@/lib/vendors/session"

const STATUSES = new Set<LeadStatus>(["new", "contacted", "closed"])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const vendorId = await getVendorSessionId()
  if (!vendorId) return NextResponse.json({ error: "Sign in required." }, { status: 401 })

  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  const status = body?.status
  if (typeof status !== "string" || !STATUSES.has(status as LeadStatus)) {
    return NextResponse.json({ error: "Choose a status." }, { status: 400 })
  }

  const own = (await listLeads()).some((lead) => lead.id === id && lead.vendorId === vendorId)
  if (!own) return NextResponse.json({ error: "This query is not on your desk." }, { status: 404 })

  const lead = await updateLeadStatus(id, status as LeadStatus)
  if (!lead) return NextResponse.json({ error: "Query not found." }, { status: 404 })
  return NextResponse.json({ lead })
}
