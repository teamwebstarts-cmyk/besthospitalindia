import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const FILE = path.join(process.cwd(), "data", "runtime", "admin.json")
export const ADMIN_COOKIE = "bhi_admin"

interface AdminAccount {
  email: string
  password: string
}

function defaultAccount(): AdminAccount {
  return {
    email: (process.env.ADMIN_EMAIL ?? "admin@besthospitalindian.com").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? "admin-demo",
  }
}

async function persistAccount(account: AdminAccount): Promise<void> {
  try {
    await mkdir(path.dirname(FILE), { recursive: true })
    await writeFile(FILE, JSON.stringify(account, null, 2), "utf8")
  } catch {
    // Serverless bundles (e.g. Vercel) are read-only — defaults still work.
  }
}

async function readAccount(): Promise<AdminAccount> {
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<AdminAccount>
    if (parsed.email && parsed.password) {
      return { email: parsed.email, password: parsed.password }
    }
  } catch {
    // missing or unreadable local file
  }
  const account = defaultAccount()
  await persistAccount(account)
  return account
}

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  const account = await readAccount()
  return account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password
}

export async function hasAdminSession(): Promise<boolean> {
  const jar = await cookies()
  return jar.get(ADMIN_COOKIE)?.value === "admin"
}

export async function adminDenied(): Promise<NextResponse | null> {
  if (await hasAdminSession()) return null
  return NextResponse.json({ error: "Sign in required." }, { status: 401 })
}
