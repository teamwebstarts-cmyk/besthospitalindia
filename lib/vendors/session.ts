import { cookies } from "next/headers"

export const VENDOR_COOKIE = "bhi_vendor"

export async function getVendorSessionId(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(VENDOR_COOKIE)?.value ?? null
}
