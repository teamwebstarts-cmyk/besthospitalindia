import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { ADMIN_COOKIE, authenticateAdmin } from "@/lib/admin/session"

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === "string" ? body.email : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!(await authenticateAdmin(email, password))) {
    return NextResponse.json({ error: "Email or password is not recognised." }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, "admin", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  })
  return response
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  return NextResponse.json({ ok: true })
}
