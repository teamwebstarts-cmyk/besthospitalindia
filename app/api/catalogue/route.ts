import { NextResponse } from "next/server"

import { adminDenied } from "@/lib/admin/session"

import {
  catalogueRecordExists,
  catalogueSnapshot,
  isCatalogueKind,
  isCatalogueStatus,
  setCatalogueStatus,
} from "@/lib/catalogue/store"

export async function GET() {
  return NextResponse.json(catalogueSnapshot())
}

export async function PATCH(request: Request) {
  const denied = await adminDenied()
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as { kind?: unknown; id?: unknown; status?: unknown } | null
  const kind = typeof body?.kind === "string" ? body.kind : ""
  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" ? body.status : ""
  if (!isCatalogueKind(kind) || !isCatalogueStatus(status) || !catalogueRecordExists(kind, id)) {
    return NextResponse.json({ error: "Choose a catalogue record and a status." }, { status: 400 })
  }
  const saved = setCatalogueStatus(kind, id, status)
  return NextResponse.json({ kind, id, status: saved })
}
