import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"
import { verifyLeadCode } from "@/lib/mail/outbox"
import { deleteLead, isLeadEmailVerified, markLeadEmailVerified, updateLeadDetail, updateLeadStatus, updateLeadTrack } from "@/lib/leads/store"
import type { LeadStatus, LeadTrack } from "@/lib/leads/types"

const STATUSES = new Set<LeadStatus>(["new", "contacted", "closed"])
const TRACKS = new Set<LeadTrack>(["consultation", "camp", "surgery"])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as { status?: string; track?: string; detail?: string; otp?: string } | null
  if (typeof body?.otp === "string") {
    const matches = await verifyLeadCode(id, body.otp)
    if (!matches) return NextResponse.json({ error: "That code does not match." }, { status: 400 })
    const lead = await markLeadEmailVerified(id)
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    return NextResponse.json({ lead })
  }
  if (typeof body?.detail === "string") {
    if (!(await isLeadEmailVerified(id))) {
      return NextResponse.json({ error: "Verify your email code before continuing." }, { status: 403 })
    }
    const lead = await updateLeadDetail(id, body.detail.slice(0, 1000))
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    return NextResponse.json({ lead })
  }
  if (body?.track) {
    if (!(await isLeadEmailVerified(id))) {
      return NextResponse.json({ error: "Verify your email code before continuing." }, { status: 403 })
    }
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
  const denied = await adminDenied()
  if (denied) return denied
  const lead = await updateLeadStatus(id, status as LeadStatus)
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
  return NextResponse.json({ lead })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminDenied()
  if (denied) return denied
  const { id } = await context.params
  const removed = await deleteLead(id)
  if (!removed) return NextResponse.json({ error: "Lead not found." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
