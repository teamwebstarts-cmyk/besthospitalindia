import "server-only"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { readDoc, writeDoc } from "@/lib/db/adapters"
import { doctorById, facilityById, hospitalById } from "@/data"

export type CatalogueKind = "hospital" | "doctor" | "facility"
export type CatalogueStatus = "approved" | "pending" | "rejected"

type StatusMap = Record<string, CatalogueStatus>
type CatalogueFile = Record<CatalogueKind, StatusMap> & {
  submissions?: unknown
}

const FILE = path.join(process.cwd(), "data", "runtime", "catalogue.json")
const KINDS: CatalogueKind[] = ["hospital", "doctor", "facility"]
const STATUSES = new Set<CatalogueStatus>(["approved", "pending", "rejected"])

function emptyFile(): CatalogueFile {
  return { hospital: {}, doctor: {}, facility: {} }
}

function readFile(): CatalogueFile {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<CatalogueFile>
    return {
      hospital: parsed.hospital ?? {},
      doctor: parsed.doctor ?? {},
      facility: parsed.facility ?? {},
      submissions: parsed.submissions,
    }
  } catch {
    return emptyFile()
  }
}

function writeFile(next: CatalogueFile) {
  mkdirSync(path.dirname(FILE), { recursive: true })
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8")
}

/** Mongo-backed status map, or the legacy JSON file as fallback. */
async function readSnapshot(): Promise<CatalogueFile> {
  const fromMongo = await readDoc<CatalogueFile>("catalogue", "statuses", emptyFile())
  if (fromMongo) {
    return {
      hospital: fromMongo.hospital ?? {},
      doctor: fromMongo.doctor ?? {},
      facility: fromMongo.facility ?? {},
    }
  }
  return readFile()
}

async function writeSnapshot(next: CatalogueFile): Promise<void> {
  const saved = await writeDoc("catalogue", "statuses", {
    hospital: next.hospital,
    doctor: next.doctor,
    facility: next.facility,
  })
  if (saved) return
  writeFile(next)
}

export async function catalogueSnapshot(): Promise<CatalogueFile> {
  return readSnapshot()
}

export function isCatalogueKind(value: string): value is CatalogueKind {
  return KINDS.includes(value as CatalogueKind)
}

export function isCatalogueStatus(value: string): value is CatalogueStatus {
  return STATUSES.has(value as CatalogueStatus)
}

export function catalogueRecordExists(kind: CatalogueKind, id: string): boolean {
  if (kind === "hospital") return hospitalById[id] !== undefined
  if (kind === "doctor") return doctorById[id] !== undefined
  return facilityById[id] !== undefined
}

/** Missing rows stay public so the current catalogue does not disappear. */
export async function catalogueStatus(kind: CatalogueKind, id: string): Promise<CatalogueStatus> {
  return (await readSnapshot())[kind][id] ?? "approved"
}

export async function isCataloguePublic(kind: CatalogueKind, id: string): Promise<boolean> {
  return (await catalogueStatus(kind, id)) === "approved"
}

export async function setCatalogueStatus(kind: CatalogueKind, id: string, status: CatalogueStatus): Promise<CatalogueStatus> {
  const file = await readSnapshot()
  if (status === "approved") {
    delete file[kind][id]
  } else {
    file[kind][id] = status
  }
  await writeSnapshot(file)
  return status
}
