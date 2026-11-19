import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"
import { isCatalogueStatus } from "@/lib/catalogue/store"
import { createSubmission, deleteSubmission, listSubmissions, markSubmissionEmailVerified, updateSubmission } from "@/lib/catalogue/submissions"
import { forgetLeadCode, recordLeadCode, verifyLeadCode } from "@/lib/mail/outbox"

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? ""
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter the official email used on the form." }, { status: 400 })
  }
  const submissions = listSubmissions().filter((row) => row.email === email)
  return NextResponse.json({
    submissions: submissions.map((row) => ({
      id: row.id,
      kind: row.kind,
      name: row.name,
      city: row.city,
      status: row.status,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
    })),
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const kind = body?.kind === "hospital" || body?.kind === "doctor" ? body.kind : null
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const phone = typeof body?.phone === "string" ? body.phone.trim() : ""
  const city = typeof body?.city === "string" ? body.city.trim() : ""
  const note = typeof body?.note === "string" ? body.note.trim() : ""
  if (!kind || name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || city.length < 2) {
    return NextResponse.json({ error: "Enter the name, official email, and city." }, { status: 400 })
  }
  try {
    const submission = createSubmission({ kind, name, email, phone, city, note })
    await recordLeadCode(submission.id, submission.email, "application")
    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "FREE_EMAIL") {
      return NextResponse.json({ error: "Use an official email. Free inboxes such as Gmail are not accepted." }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Could not save the submission."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = typeof body?.id === "string" ? body.id : ""
  const patch: {
    name?: string
    email?: string
    phone?: string
    city?: string
    note?: string
    status?: "approved" | "pending" | "rejected"
  } = {}
  if (typeof body?.name === "string") patch.name = body.name.trim()
  if (typeof body?.email === "string") patch.email = body.email.trim()
  if (typeof body?.phone === "string") patch.phone = body.phone.trim()
  if (typeof body?.city === "string") patch.city = body.city.trim()
  if (typeof body?.note === "string") patch.note = body.note.trim()
  if (typeof body?.status === "string") {
    if (!isCatalogueStatus(body.status)) {
      return NextResponse.json({ error: "Choose a valid status." }, { status: 400 })
    }
    patch.status = body.status
  }
  const accountEmail = typeof body?.accountEmail === "string" ? body.accountEmail.trim().toLowerCase() : ""
  if (typeof body?.otp === "string") {
    if (!accountEmail) return NextResponse.json({ error: "Use the official email from the application." }, { status: 400 })
    const existing = listSubmissions().find((row) => row.id === id && row.email === accountEmail)
    if (!existing) return NextResponse.json({ error: "Submission not found." }, { status: 404 })
    if (!(await verifyLeadCode(id, body.otp))) {
      return NextResponse.json({ error: "That code does not match." }, { status: 400 })
    }
    const submission = markSubmissionEmailVerified(id)
    if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 })
    return NextResponse.json({ submission })
  }
  if (!accountEmail) {
    const denied = await adminDenied()
    if (denied) return denied
  }
  if (accountEmail) {
    const existing = listSubmissions().find((row) => row.id === id)
    if (!existing || existing.email !== accountEmail) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 })
    }
    if (!existing.emailVerified) {
      return NextResponse.json({ error: "Verify your email code before editing." }, { status: 403 })
    }
    delete patch.status
    delete patch.email
    const nameChanged = patch.name !== undefined && patch.name !== existing.name
    const cityChanged = patch.city !== undefined && patch.city !== existing.city
    if (nameChanged || cityChanged) patch.status = "pending"
  }
  if (!id || Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Choose a submission and a change." }, { status: 400 })
  }
  if (patch.name !== undefined && patch.name.length < 2) {
    return NextResponse.json({ error: "Enter the name." }, { status: 400 })
  }
  if (patch.city !== undefined && patch.city.length < 2) {
    return NextResponse.json({ error: "Enter the city." }, { status: 400 })
  }
  try {
    const submission = updateSubmission(id, patch)
    if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 })
    return NextResponse.json({ submission })
  } catch (error) {
    if (error instanceof Error && error.message === "FREE_EMAIL") {
      return NextResponse.json({ error: "Use an official email. Free inboxes such as Gmail are not accepted." }, { status: 400 })
    }
    return NextResponse.json({ error: "Could not update the submission." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const denied = await adminDenied()
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (!id || !deleteSubmission(id)) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 })
  }
  await forgetLeadCode(id)
  return NextResponse.json({ ok: true })
}
