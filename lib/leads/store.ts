import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { activeVendorId } from "@/lib/vendors/store"

import type { Lead, LeadInput, LeadStatus, LeadTrack } from "./types"

const FILE = path.join(process.cwd(), "data", "runtime", "leads.json")

let queue: Promise<unknown> = Promise.resolve()

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readAll(): Promise<Lead[]> {
  try {
    const raw = await readFile(FILE, "utf8")
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return (parsed as Lead[]).map((lead) => ({ ...lead, track: lead.track ?? null }))
  } catch {
    return []
  }
}

async function writeAll(leads: Lead[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(leads, null, 2), "utf8")
}

function nextId(leads: Lead[]): string {
  const used = new Set(leads.map((lead) => lead.id))
  let id = ""
  do {
    id = String(Math.floor(100000 + Math.random() * 900000))
  } while (used.has(id))
  return id
}

export function listLeads(): Promise<Lead[]> {
  return withLock(async () => {
    const leads = await readAll()
    return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })
}

export function createLead(input: LeadInput): Promise<Lead> {
  return withLock(async () => {
    const vendorId = await activeVendorId(input.preferredCity)
    if (!vendorId) {
      throw new Error("NO_VENDOR")
    }
    const leads = await readAll()
    const now = new Date().toISOString()
    const lead: Lead = {
      id: nextId(leads),
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      comment: input.comment?.trim() || "",
      audience: input.audience,
      state: input.audience === "indian" ? input.state?.trim() || null : null,
      embassy: input.audience === "others" ? input.embassy ?? null : null,
      preferredCity: input.preferredCity,
      track: null,
      vendorId,
      status: "new",
      createdAt: now,
      updatedAt: now,
    }
    leads.push(lead)
    await writeAll(leads)
    return lead
  })
}

export function updateLeadTrack(id: string, track: LeadTrack): Promise<Lead | null> {
  return withLock(async () => {
    const leads = await readAll()
    const lead = leads.find((item) => item.id === id)
    if (!lead) return null
    lead.track = track
    lead.updatedAt = new Date().toISOString()
    await writeAll(leads)
    return lead
  })
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | null> {
  return withLock(async () => {
    const leads = await readAll()
    const lead = leads.find((item) => item.id === id)
    if (!lead) return null
    lead.status = status
    lead.updatedAt = new Date().toISOString()
    await writeAll(leads)
    return lead
  })
}

export function deleteLead(id: string): Promise<boolean> {
  return withLock(async () => {
    const leads = await readAll()
    const next = leads.filter((item) => item.id !== id)
    if (next.length === leads.length) return false
    await writeAll(next)
    return true
  })
}
