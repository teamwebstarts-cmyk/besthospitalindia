import "server-only"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { cache } from "react"

import { readArray, writeArray } from "@/lib/db/adapters"
import { buildMissingFixtureSeeds } from "@/lib/catalogue/seed-fixtures"
import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"

/**
 * Rich, optional profile fields collected from the admin panel and partner
 * forms. Everything except the identity/contact basics is optional so older
 * submissions (and minimal quick-add rows) stay valid. These fields are the
 * single source of truth for what an approved listing shows on its public card
 * and detail page — ratings are deliberately NOT part of this: they only come
 * from approved assessment workflows and always render as "Not yet rated".
 */
export interface CatalogueProfileFields {
  /** Stable public URL when seeded from fixtures; otherwise derived from name + id. */
  slug?: string
  overview?: string
  state?: string
  country?: string
  imageUrl?: string
  facilityType?: string
  specialties?: string[]
  treatments?: string[]
  accreditations?: string[]
  specialization?: string
  qualifications?: string[]
  yearsExperience?: number | null
  languages?: string[]
  category?: string
  services?: string[]
  perScore?: number | null
  cerScore?: number | null
  merScore?: number | null
  doctorIds?: string[]
  hospitalIds?: string[]
  doctorNames?: string[]
  treatmentNames?: string[]
  accessibility?: string[]
}

export type CatalogueSubmissionSource = "admin" | "partner" | "seed"

export interface CatalogueSubmission extends CatalogueProfileFields {
  id: string
  kind: CatalogueKind
  name: string
  email: string
  phone: string
  city: string
  note: string
  status: CatalogueStatus
  emailVerified: boolean
  /** Who created the row — partner self-serve stays pending until admin approves. */
  source?: CatalogueSubmissionSource
  createdAt: string
  updatedAt: string
}

const FILE = path.join(process.cwd(), "data", "runtime", "catalogue.json")
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "rediffmail.com",
  "icloud.com",
])

function readFile(): CatalogueSubmission[] {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as { submissions?: unknown }
    if (Array.isArray(parsed.submissions)) {
      return (parsed.submissions as CatalogueSubmission[]).map((row) => ({ ...row, emailVerified: row.emailVerified ?? false }))
    }
  } catch {
    // empty
  }
  return []
}

function writeFile(rows: CatalogueSubmission[]): void {
  mkdirSync(path.dirname(FILE), { recursive: true })
  let existing: Record<string, unknown> = {}
  try {
    existing = JSON.parse(readFileSync(FILE, "utf8")) as Record<string, unknown>
  } catch {
    // new file
  }
  writeFileSync(FILE, JSON.stringify({ ...existing, submissions: rows }, null, 2), "utf8")
}

let seedPass = false

/** All submissions: shared Mongo collection when configured, file otherwise. */
async function readAllRaw(): Promise<CatalogueSubmission[]> {
  const fromMongo = await readArray<CatalogueSubmission>("submissions")
  if (fromMongo) return fromMongo
  return readFile()
}

async function ensureFixtureSeeds(): Promise<void> {
  if (seedPass) return
  const current = await readAllRaw()
  const insert = buildMissingFixtureSeeds(current)
  if (insert.length === 0) {
    seedPass = true
    return
  }
  await persist([...insert, ...current])
  seedPass = true
}

/** All submissions: shared Mongo collection when configured, file otherwise. */
const readAll = cache(async (): Promise<CatalogueSubmission[]> => {
  await ensureFixtureSeeds()
  return readAllRaw()
})

async function persist(rows: CatalogueSubmission[]): Promise<void> {
  if (await writeArray("submissions", rows)) return
  writeFile(rows)
}

export function isOfficialEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? ""
  return domain.length > 0 && !FREE_EMAIL_DOMAINS.has(domain)
}

export async function listSubmissions(kind?: CatalogueKind): Promise<CatalogueSubmission[]> {
  const rows = await readAll()
  return kind ? rows.filter((row) => row.kind === kind) : rows
}

/** Admin panel — listings go live immediately (approved + email verified). */
export async function createAdminSubmission(
  input: Omit<CatalogueSubmission, "id" | "status" | "emailVerified" | "createdAt" | "updatedAt">,
): Promise<CatalogueSubmission> {
  const rows = await readAll()
  const now = new Date().toISOString()
  const submission: CatalogueSubmission = {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    note: input.note.trim(),
    id: `sub-${Math.floor(100000 + Math.random() * 900000)}`,
    status: "approved",
    emailVerified: true,
    source: "admin",
    createdAt: now,
    updatedAt: now,
  }
  rows.unshift(submission)
  await persist(rows)
  return submission
}

export async function createSubmission(
  input: Omit<CatalogueSubmission, "id" | "status" | "emailVerified" | "createdAt" | "updatedAt">,
  options?: { emailVerified?: boolean },
): Promise<CatalogueSubmission> {
  if (!isOfficialEmail(input.email)) throw new Error("FREE_EMAIL")
  const rows = await readAll()
  const now = new Date().toISOString()
  const submission: CatalogueSubmission = {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    note: input.note.trim(),
    id: `sub-${Math.floor(100000 + Math.random() * 900000)}`,
    status: "pending",
    emailVerified: options?.emailVerified ?? false,
    source: "partner",
    createdAt: now,
    updatedAt: now,
  }
  rows.unshift(submission)
  await persist(rows)
  return submission
}

export async function markSubmissionEmailVerified(id: string): Promise<CatalogueSubmission | null> {
  const rows = await readAll()
  const submission = rows.find((row) => row.id === id)
  if (!submission) return null
  submission.emailVerified = true
  submission.updatedAt = new Date().toISOString()
  await persist(rows)
  return submission
}

export async function setSubmissionStatus(id: string, status: CatalogueStatus): Promise<CatalogueSubmission | null> {
  return updateSubmission(id, { status })
}

/** Fields an admin (or a verified applicant) is allowed to patch. */
const PATCHABLE_PROFILE_FIELDS: (keyof CatalogueProfileFields)[] = [
  "overview", "state", "country", "imageUrl", "facilityType",
  "specialties", "treatments", "accreditations", "specialization",
  "qualifications", "yearsExperience", "languages", "category", "services",
  "slug",
  "perScore", "cerScore", "merScore", "doctorIds", "hospitalIds", "doctorNames", "treatmentNames", "accessibility",
]

export async function updateSubmission(
  id: string,
  patch: Partial<Pick<CatalogueSubmission, "name" | "email" | "phone" | "city" | "note" | "status"> & CatalogueProfileFields>,
): Promise<CatalogueSubmission | null> {
  const rows = await readAll()
  const submission = rows.find((row) => row.id === id)
  if (!submission) return null
  if (patch.email !== undefined && !isOfficialEmail(patch.email)) throw new Error("FREE_EMAIL")
  if (patch.name !== undefined) submission.name = patch.name.trim()
  if (patch.email !== undefined) submission.email = patch.email.trim().toLowerCase()
  if (patch.phone !== undefined) submission.phone = patch.phone.trim()
  if (patch.city !== undefined) submission.city = patch.city.trim()
  if (patch.note !== undefined) submission.note = patch.note.trim()
  if (patch.status !== undefined) submission.status = patch.status
  for (const field of PATCHABLE_PROFILE_FIELDS) {
    if (patch[field] !== undefined) {
      (submission as unknown as Record<string, unknown>)[field] = patch[field]
    }
  }
  submission.updatedAt = new Date().toISOString()
  await persist(rows)
  return submission
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const rows = await readAll()
  const next = rows.filter((row) => row.id !== id)
  if (next.length === rows.length) return false
  await persist(next)
  return true
}
