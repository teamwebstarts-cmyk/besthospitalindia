import { NextResponse } from "next/server"

import { isCatalogueStatus } from "@/lib/catalogue/store"
import { createSubmission, listSubmissions, setSubmissionStatus } from "@/lib/catalogue/submissions"

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
  const body = (await request.json().catch(() => null)) as { id?: unknown; status?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" ? body.status : ""
  if (!id || !isCatalogueStatus(status)) {
    return NextResponse.json({ error: "Choose a submission and a status." }, { status: 400 })
  }
  const submission = setSubmissionStatus(id, status)
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 })
  return NextResponse.json({ submission })
}
