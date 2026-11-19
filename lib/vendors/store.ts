import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { LeadCity } from "@/lib/leads/types"

import type { Vendor, VendorInput, VendorPublic } from "./types"

const FILE = path.join(process.cwd(), "data", "runtime", "vendors.json")

let queue: Promise<unknown> = Promise.resolve()

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function seed(): Vendor[] {
  const now = new Date().toISOString()
  return [
    {
      id: "vendor-delhi",
      name: "Delhi desk",
      email: "delhi@besthospitalindian.com",
      password: "delhi-demo",
      city: "delhi",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "vendor-indore",
      name: "Indore desk",
      email: "indore@besthospitalindian.com",
      password: "indore-demo",
      city: "indore",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

async function readAll(): Promise<Vendor[]> {
  try {
    const raw = await readFile(FILE, "utf8")
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Vendor[]
  } catch {
    // missing file falls through to the seed
  }
  const vendors = seed()
  await writeAll(vendors)
  return vendors
}

async function writeAll(vendors: Vendor[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(vendors, null, 2), "utf8")
}

export function toPublic(vendor: Vendor): VendorPublic {
  const { password: _password, ...rest } = vendor
  return rest
}

export function listVendors(): Promise<VendorPublic[]> {
  return withLock(async () => (await readAll()).map(toPublic))
}

export function activeVendorId(city: LeadCity): Promise<string | null> {
  return withLock(async () => {
    const vendor = (await readAll()).find((item) => item.city === city && item.active)
    return vendor?.id ?? null
  })
}

export function authenticateVendor(email: string, password: string): Promise<VendorPublic | null> {
  return withLock(async () => {
    const vendor = (await readAll()).find(
      (item) => item.active && item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    )
    return vendor ? toPublic(vendor) : null
  })
}

export function getVendor(id: string): Promise<VendorPublic | null> {
  return withLock(async () => {
    const vendor = (await readAll()).find((item) => item.id === id)
    return vendor ? toPublic(vendor) : null
  })
}

function keepOneActiveDesk(vendors: Vendor[], city: LeadCity, keepId: string, now: string) {
  for (const item of vendors) {
    if (item.city === city && item.id !== keepId && item.active) {
      item.active = false
      item.updatedAt = now
    }
  }
}

export function createVendor(input: VendorInput): Promise<VendorPublic> {
  return withLock(async () => {
    const vendors = await readAll()
    const now = new Date().toISOString()
    const vendor: Vendor = {
      id: `vendor-${input.city}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      city: input.city,
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    keepOneActiveDesk(vendors, vendor.city, vendor.id, now)
    vendors.push(vendor)
    await writeAll(vendors)
    return toPublic(vendor)
  })
}

export function updateVendor(
  id: string,
  patch: Partial<Pick<Vendor, "name" | "email" | "password" | "city" | "active">>,
): Promise<VendorPublic | null> {
  return withLock(async () => {
    const vendors = await readAll()
    const vendor = vendors.find((item) => item.id === id)
    if (!vendor) return null
    if (patch.name !== undefined) vendor.name = patch.name.trim()
    if (patch.email !== undefined) vendor.email = patch.email.trim().toLowerCase()
    if (patch.password) vendor.password = patch.password
    if (patch.city) vendor.city = patch.city
    if (patch.active !== undefined) vendor.active = patch.active
    const now = new Date().toISOString()
    vendor.updatedAt = now
    if (vendor.active) keepOneActiveDesk(vendors, vendor.city, vendor.id, now)
    await writeAll(vendors)
    return toPublic(vendor)
  })
}

export function deleteVendor(id: string): Promise<boolean> {
  return withLock(async () => {
    const vendors = await readAll()
    const next = vendors.filter((item) => item.id !== id)
    if (next.length === vendors.length) return false
    await writeAll(next)
    return true
  })
}
