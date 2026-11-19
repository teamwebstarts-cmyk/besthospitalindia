import type { LeadCity } from "@/lib/leads/types"

export interface Vendor {
  id: string
  name: string
  email: string
  password: string
  city: LeadCity
  active: boolean
  createdAt: string
  updatedAt: string
}

export type VendorPublic = Omit<Vendor, "password">

export interface VendorInput {
  name: string
  email: string
  password: string
  city: LeadCity
}
