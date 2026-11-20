import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

import { cookies } from "next/headers"

import type { CatalogueKind } from "@/lib/catalogue/store"

export const PARTNER_COOKIE = "bhi_partner"

const SECRET = process.env.PARTNER_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "partner-dev-session"

export interface PartnerSession {
  email: string
  kind: CatalogueKind
}

function signPayload(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url")
}

export function encodePartnerSession(email: string, kind: CatalogueKind): string {
  const payload = `${email.trim().toLowerCase()}|${kind}`
  const body = Buffer.from(payload, "utf8").toString("base64url")
  return `${body}.${signPayload(payload)}`
}

export function decodePartnerSession(token: string | undefined): PartnerSession | null {
  if (!token) return null
  const dot = token.lastIndexOf(".")
  if (dot < 1) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let payload = ""
  try {
    payload = Buffer.from(body, "base64url").toString("utf8")
  } catch {
    return null
  }
  const expected = signPayload(payload)
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  const pipe = payload.indexOf("|")
  if (pipe < 1) return null
  const email = payload.slice(0, pipe)
  const kindRaw = payload.slice(pipe + 1)
  if (kindRaw !== "hospital" && kindRaw !== "doctor" && kindRaw !== "facility") return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return { email, kind: kindRaw }
}

export async function getPartnerSession(): Promise<PartnerSession | null> {
  const jar = await cookies()
  return decodePartnerSession(jar.get(PARTNER_COOKIE)?.value)
}