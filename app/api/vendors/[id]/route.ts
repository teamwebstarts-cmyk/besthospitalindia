import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"

import type { LeadCity } from "@/lib/leads/types"
import { ensureSingleActiveDesk } from "@/lib/vendors/single-desk"
import { deleteVendor, updateVendor, VendorStoreError } from "@/lib/vendors/store"

const CITIES = new Set<LeadCity>(["delhi", "indore"])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminDenied()
  if (denied) return denied
  const { id } = await context.params
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 })

  const patch: Parameters<typeof updateVendor>[1] = {}
  if (typeof body.name === "string") patch.name = body.name
  if (typeof body.email === "string") patch.email = body.email
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }
    patch.password = body.password
  }
  if (typeof body.city === "string" && CITIES.has(body.city as LeadCity)) patch.city = body.city as LeadCity
  if (typeof body.active === "boolean") patch.active = body.active

  try {
    const vendor = await updateVendor(id, patch)
    if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 })
    if (vendor.active) await ensureSingleActiveDesk(vendor.city, vendor.id)
    return NextResponse.json({ vendor })
  } catch (error) {
    if (error instanceof VendorStoreError && error.code === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "That login email is already used by another city desk." },
        { status: 409 },
      )
    }
    throw error
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminDenied()
  if (denied) return denied
  const { id } = await context.params
  const removed = await deleteVendor(id)
  if (!removed) return NextResponse.json({ error: "Vendor not found." }, { status: 404 })
  return NextResponse.json({ ok: true })
}
