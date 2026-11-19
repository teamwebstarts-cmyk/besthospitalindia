import "server-only"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

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
  /** Free-text summary shown as the profile overview / "About". */
  overview?: string
  state?: string
  country?: string
  imageUrl?: string
  /** Hospital only. */
  facilityType?: string
  /** Hospital / facility: comma-separated specialty ids, selected in the form. */
  specialties?: string[]
  /** Hospital only: comma-separated treatment ids. */
  treatments?: string[]
  /** Hospital only: accreditation names. */
  accreditations?: string[]
  /** Doctor only. */
  specialization?: string
  qualifications?: string[]
  yearsExperience?: number | null
  languages?: string[]
  /** Facility only. */
  category?: string
  services?: string[]
}

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
  createdAt: string
  updatedAt: string
}

type CatalogueFile = {
  hospital: Record<string, CatalogueStatus>
  doctor: Record<string, CatalogueStatus>
  facility: Record<string, CatalogueStatus>
  submissions: CatalogueSubmission[]
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

function readFile(): CatalogueFile {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<CatalogueFile>
    return {
      hospital: parsed.hospital ?? {},
      doctor: parsed.doctor ?? {},
      facility: parsed.facility ?? {},
      submissions: Array.isArray(parsed.submissions)
        ? parsed.submissions.map((row) => ({ ...row, emailVerified: row.emailVerified ?? false }))
        : [],
    }
  } catch {
    return { hospital: {}, doctor: {}, facility: {}, submissions: [] }
  }
}

function writeFile(next: CatalogueFile) {
  mkdirSync(path.dirname(FILE), { recursive: true })
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8")
}

export function isOfficialEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? ""
  return domain.length > 0 && !FREE_EMAIL_DOMAINS.has(domain)
}

export function listSubmissions(kind?: CatalogueKind): CatalogueSubmission[] {
  const rows = readFile().submissions
  return kind ? rows.filter((row) => row.kind === kind) : rows
}

export function createSubmission(
  input: Omit<CatalogueSubmission, "id" | "status" | "emailVerified" | "createdAt" | "updatedAt">,
): CatalogueSubmission {
  if (!isOfficialEmail(input.email)) throw new Error("FREE_EMAIL")
  const file = readFile()
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
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  }
  file.submissions.unshift(submission)
  writeFile(file)
  return submission
}

export function markSubmissionEmailVerified(id: string): CatalogueSubmission | null {
  const file = readFile()
  const submission = file.submissions.find((row) => row.id === id)
  if (!submission) return null
  submission.emailVerified = true
  submission.updatedAt = new Date().toISOString()
  writeFile(file)
  return submission
}

export function setSubmissionStatus(id: string, status: CatalogueStatus): CatalogueSubmission | null {
  return updateSubmission(id, { status })
}

/** Fields an admin (or a verified applicant) is allowed to patch. */
const PATCHABLE_PROFILE_FIELDS: (keyof CatalogueProfileFields)[] = [
  "overview", "state", "country", "imageUrl", "facilityType",
  "specialties", "treatments", "accreditations", "specialization",
  "qualifications", "yearsExperience", "languages", "category", "services",
]

export function updateSubmission(
  id: string,
  patch: Partial<Pick<CatalogueSubmission, "name" | "email" | "phone" | "city" | "note" | "status"> & CatalogueProfileFields>,
): CatalogueSubmission | null {
  const file = readFile()
  const submission = file.submissions.find((row) => row.id === id)
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
  writeFile(file)
  return submission
}

export function deleteSubmission(id: string): boolean {
  const file = readFile()
  const next = file.submissions.filter((row) => row.id !== id)
  if (next.length === file.submissions.length) return false
  file.submissions = next
  writeFile(file)
  return true
}
