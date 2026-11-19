import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"
import { isCatalogueKind, isCatalogueStatus } from "@/lib/catalogue/store"
import {
  createSubmission, deleteSubmission, listSubmissions, markSubmissionEmailVerified, updateSubmission,
  type CatalogueProfileFields,
} from "@/lib/catalogue/submissions"
import { forgetLeadCode, recordLeadCode, verifyLeadCode } from "@/lib/mail/outbox"

function str(body: Record<string, unknown> | null, key: string): string {
  const value = body?.[key]
  return typeof value === "string" ? value.trim() : ""
}

function strList(body: Record<string, unknown> | null, key: string): string[] | undefined {
  const value = body?.[key]
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string")
  if (typeof value === "string") {
    return value.split(/[,\n]/).map((v) => v.trim()).filter(Boolean)
  }
  return undefined
}

function profileFrom(body: Record<string, unknown> | null): Partial<CatalogueProfileFields> {
  const profile: Partial<CatalogueProfileFields> = {}
  const textKeys = ["overview", "state", "country", "imageUrl", "facilityType", "specialization", "category"] as const
  for (const key of textKeys) {
    const value = str(body, key)
    if (value) (profile as Record<string, unknown>)[key] = value
  }
  for (const key of ["specialties", "treatments", "accreditations", "qualifications", "languages", "services", "doctorIds", "doctorNames", "treatmentNames", "accessibility"] as const) {
    const value = strList(body, key)
    if (value) (profile as Record<string, unknown>)[key] = value
  }
  for (const key of ["perScore", "cerScore", "merScore"] as const) {
    const raw = body?.[key]
    if (raw === null || raw === "") {
      (profile as Record<string, unknown>)[key] = null
      continue
    }
    const score = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : undefined
    if (typeof score === "number" && Number.isFinite(score)) (profile as Record<string, unknown>)[key] = score
  }
  const years = body?.yearsExperience
  if (typeof years === "number" && Number.isFinite(years)) profile.yearsExperience = years
  else if (typeof years === "string" && years.trim() !== "" && Number.isFinite(Number(years))) {
    profile.yearsExperience = Number(years)
  }
  return profile
}

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
  const rawKind = str(body, "kind")
  const kind = isCatalogueKind(rawKind) ? rawKind : null
  const name = str(body, "name")
  const email = str(body, "email")
  const phone = str(body, "phone")
  const city = str(body, "city")
  const note = str(body, "note")
  if (!kind || name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || city.length < 2) {
    return NextResponse.json({ error: "Enter the name, official email, and city." }, { status: 400 })
  }
  try {
    const submission = createSubmission({ kind, name, email, phone, city, note, ...profileFrom(body) })
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
  const id = str(body, "id")
  const patch: Parameters<typeof updateSubmission>[1] = { ...profileFrom(body) }
  if (body?.name !== undefined) patch.name = str(body, "name")
  if (body?.email !== undefined) patch.email = str(body, "email")
  if (body?.phone !== undefined) patch.phone = str(body, "phone")
  if (body?.city !== undefined) patch.city = str(body, "city")
  if (body?.note !== undefined) patch.note = str(body, "note")
  if (body?.status !== undefined) {
    if (!isCatalogueStatus(String(body.status))) {
      return NextResponse.json({ error: "Choose a valid status." }, { status: 400 })
    }
    patch.status = body.status as "approved" | "pending" | "rejected"
  }
  const accountEmail = str(body, "accountEmail").toLowerCase()
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
