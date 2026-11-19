import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"

import type { LeadCity } from "@/lib/leads/types"
import { ensureSingleActiveDesk } from "@/lib/vendors/single-desk"
import { createVendor, listVendors } from "@/lib/vendors/store"
import type { VendorInput } from "@/lib/vendors/types"

const CITIES = new Set<LeadCity>(["delhi", "indore"])

function parseInput(body: unknown): { ok: true; value: VendorInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." }
  const raw = body as Record<string, unknown>
  const name = typeof raw.name === "string" ? raw.name.trim() : ""
  const email = typeof raw.email === "string" ? raw.email.trim() : ""
  const password = typeof raw.password === "string" ? raw.password : ""
  const city = typeof raw.city === "string" && CITIES.has(raw.city as LeadCity) ? (raw.city as LeadCity) : null
  if (name.length < 2) return { ok: false, error: "Enter a vendor name." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." }
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }
  if (!city) return { ok: false, error: "Choose Delhi or Indore." }
  return { ok: true, value: { name, email, password, city } }
}

export async function GET() {
  const denied = await adminDenied()
  if (denied) return denied
  const vendors = await listVendors()
  return NextResponse.json({ vendors })
}

export async function POST(request: Request) {
  const denied = await adminDenied()
  if (denied) return denied
  const parsed = parseInput(await request.json().catch(() => null))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const vendor = await createVendor(parsed.value)
  await ensureSingleActiveDesk(vendor.city, vendor.id)
  return NextResponse.json({ vendor }, { status: 201 })
}
