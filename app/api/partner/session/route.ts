import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isCatalogueKind } from "@/lib/catalogue/store"
import { listSubmissions } from "@/lib/catalogue/submissions"
import { partnerOtpLeadId } from "@/lib/partner/otp"
import { decodePartnerSession, encodePartnerSession, PARTNER_COOKIE } from "@/lib/partner/session"
import { verifyLeadCode } from "@/lib/mail/outbox"

export async function GET() {
  const jar = await cookies()
  const session = decodePartnerSession(jar.get(PARTNER_COOKIE)?.value)
  if (!session) {
    return NextResponse.json({ session: null })
  }
  const submissions = (await listSubmissions())
    .filter((row) => row.email === session.email && row.kind === session.kind)
    .map((row) => ({
      id: row.id,
      kind: row.kind,
      name: row.name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      state: row.state,
      imageUrl: row.imageUrl,
      overview: row.overview,
      note: row.note,
      status: row.status,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  return NextResponse.json({ session, submissions })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown
    kind?: unknown
    otp?: unknown
  } | null
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const kindRaw = typeof body?.kind === "string" ? body.kind : ""
  const kind = isCatalogueKind(kindRaw) && kindRaw !== "facility" ? kindRaw : null
  const otp = typeof body?.otp === "string" ? body.otp.trim() : ""

  if (!email || !kind || otp.length < 6) {
    return NextResponse.json({ error: "Enter your official email and the sign-in code." }, { status: 400 })
  }

  const leadId = partnerOtpLeadId(email, "signin")
  if (!(await verifyLeadCode(leadId, otp))) {
    return NextResponse.json({ error: "That code does not match." }, { status: 400 })
  }

  const token = encodePartnerSession(email, kind)
  const response = NextResponse.json({ ok: true, kind, email })
  response.cookies.set(PARTNER_COOKIE, token, {
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
  jar.delete(PARTNER_COOKIE)
  return NextResponse.json({ ok: true })
}