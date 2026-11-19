import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { VENDOR_COOKIE } from "@/lib/vendors/session"
import { authenticateVendor } from "@/lib/vendors/store"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === "string" ? body.email : ""
  const password = typeof body?.password === "string" ? body.password : ""
  const vendor = await authenticateVendor(email, password)
  if (!vendor) {
    return NextResponse.json({ error: "Email or password is not recognised." }, { status: 401 })
  }
  const jar = await cookies()
  jar.set(VENDOR_COOKIE, vendor.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 })
  return NextResponse.json({ vendor })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(VENDOR_COOKIE)
  return NextResponse.json({ ok: true })
}
