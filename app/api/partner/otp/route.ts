import { NextResponse } from "next/server"

import { isOfficialEmail } from "@/lib/catalogue/submissions"
import { partnerOtpLeadId, type PartnerOtpPurpose } from "@/lib/partner/otp"
import { recordLeadCode, verifyLeadCode } from "@/lib/mail/outbox"

function purpose(raw: unknown): PartnerOtpPurpose | null {
  return raw === "register" || raw === "signin" ? raw : null
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown
    purpose?: unknown
    action?: unknown
    otp?: unknown
  } | null
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const otpPurpose = purpose(body?.purpose)
  const action = body?.action === "verify" ? "verify" : "send"

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid official email." }, { status: 400 })
  }
  if (!otpPurpose) {
    return NextResponse.json({ error: "Choose register or sign-in." }, { status: 400 })
  }
  if (!isOfficialEmail(email)) {
    return NextResponse.json(
      { error: "Use an official email. Free inboxes such as Gmail are not accepted." },
      { status: 400 },
    )
  }

  const leadId = partnerOtpLeadId(email, otpPurpose)

  if (action === "verify") {
    const code = typeof body?.otp === "string" ? body.otp.trim() : ""
    if (code.length < 6) {
      return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 })
    }
    if (!(await verifyLeadCode(leadId, code))) {
      return NextResponse.json({ error: "That code does not match. Request a new one if it expired." }, { status: 400 })
    }
    return NextResponse.json({ verified: true })
  }

  await recordLeadCode(leadId, email, "application")
  return NextResponse.json({ sent: true })
}