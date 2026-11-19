import { NextResponse } from "next/server"

import { deleteLead, updateLeadStatus, updateLeadTrack } from "@/lib/leads/store"
import type { LeadStatus, LeadTrack } from "@/lib/leads/types"

const STATUSES = new Set<LeadStatus>(["new", "contacted", "closed"])
const TRACKS = new Set<LeadTrack>(["consultation", "camp", "surgery"])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: string; track?: string } | null
  if (body?.track) {
    if (!TRACKS.has(body.track as LeadTrack)) {
      return NextResponse.json({ error: "Choose a request type." }, { status: 400 })
    }
    const lead = await updateLeadTrack(id, body.track as LeadTrack)
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    return NextResponse.json({ lead })
  }
  const status = body?.status
  if (!status || !STATUSES.has(status as LeadStatus)) {
    return NextResponse.json({ error: "Choose a status." }, { status: 400 })
  }
  const lead = await updateLeadStatus(id, status as LeadStatus)
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
  return NextResponse.json({ lead })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const removed = await deleteLead(id)
  if (!removed) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
