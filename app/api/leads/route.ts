import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"
import { getLatestLeadCode } from "@/lib/mail/outbox"
import { mailProvider } from "@/lib/mail/sender"

import { createLead, listLeads } from "@/lib/leads/store"
import type { LeadAudience, LeadCity, LeadEmbassy, LeadInput } from "@/lib/leads/types"

const CITIES = new Set<LeadCity>(["delhi", "indore"])
const EMBASSIES = new Set<LeadEmbassy>(["kenya", "nepal"])

function parseInput(body: unknown): { ok: true; value: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." }
  const raw = body as Record<string, unknown>
  const name = typeof raw.name === "string" ? raw.name.trim() : ""
  const email = typeof raw.email === "string" ? raw.email.trim() : ""
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : ""
  const comment = typeof raw.comment === "string" ? raw.comment.trim() : ""
  const audience = raw.audience === "indian" || raw.audience === "others" ? raw.audience : null
  const state = typeof raw.state === "string" ? raw.state.trim() : ""
  const embassy = raw.embassy === "kenya" || raw.embassy === "nepal" ? raw.embassy : null
  const preferredCity = typeof raw.preferredCity === "string" && CITIES.has(raw.preferredCity as LeadCity)
    ? (raw.preferredCity as LeadCity)
    : null

  if (name.length < 2) return { ok: false, error: "Enter your name." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." }
  if (!audience) return { ok: false, error: "Choose Indian or Others." }
  if (audience === "indian" && !state) return { ok: false, error: "Choose your state." }
  if (audience === "others" && !embassy) return { ok: false, error: "Choose an embassy." }
  if (embassy && !EMBASSIES.has(embassy)) return { ok: false, error: "Choose an embassy." }
  if (!preferredCity) return { ok: false, error: "Choose Delhi or Indore." }

  return {
    ok: true,
    value: {
      name,
      email,
      phone,
      comment,
      audience: audience as LeadAudience,
      state,
      embassy: embassy ?? undefined,
      preferredCity,
    },
  }
}

export async function GET() {
  const denied = await adminDenied()
  if (denied) return denied
  const leads = await listLeads()
  return NextResponse.json({ leads })
}

export async function POST(request: Request) {
  const parsed = parseInput(await request.json().catch(() => null))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const lead = await createLead(parsed.value)
  // Local demo aid: with no real mail configured, expose the mock OTP so the
  // full workflow can be tested in one click. Never returned when mail is live.
  const demoCode = mailProvider() === "outbox" ? await getLatestLeadCode(lead.id) : null
  return NextResponse.json({ lead, demoCode }, { status: 201 })
}
