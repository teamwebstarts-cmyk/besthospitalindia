import "server-only"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { doctorById, facilityById, hospitalById } from "@/data"

export type CatalogueKind = "hospital" | "doctor" | "facility"
export type CatalogueStatus = "approved" | "pending" | "rejected"

type CatalogueFile = Record<CatalogueKind, Record<string, CatalogueStatus>> & {
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

export function catalogueSnapshot(): CatalogueFile {
  return readFile()
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
export function catalogueStatus(kind: CatalogueKind, id: string): CatalogueStatus {
  return readFile()[kind][id] ?? "approved"
}

export function isCataloguePublic(kind: CatalogueKind, id: string): boolean {
  return catalogueStatus(kind, id) === "approved"
}

export function setCatalogueStatus(kind: CatalogueKind, id: string, status: CatalogueStatus): CatalogueStatus {
  const file = readFile()
  if (status === "approved") {
    delete file[kind][id]
  } else {
    file[kind][id] = status
  }
  writeFile(file)
  return status
}
