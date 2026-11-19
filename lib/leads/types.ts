export type LeadAudience = "indian" | "others"
export type LeadEmbassy = "kenya" | "nepal"
export type LeadCity = "delhi" | "indore"
export type LeadStatus = "new" | "contacted" | "closed"
export type LeadTrack = "consultation" | "camp" | "surgery"
export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  comment: string
  audience: LeadAudience
  state: string | null
  embassy: LeadEmbassy | null
  preferredCity: LeadCity
  track: LeadTrack | null
  detail: string | null
  emailVerified: boolean
  vendorId: string | null
  status: LeadStatus
  createdAt: string
  updatedAt: string
}

export interface LeadInput {
  name: string
  email: string
  phone?: string
  comment?: string
  audience: LeadAudience
  state?: string
  embassy?: LeadEmbassy
  preferredCity: LeadCity
}
