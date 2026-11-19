import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { sendTransactionalMail } from "./sender"

const FILE = path.join(process.cwd(), "data", "runtime", "outbox.json")
const FROM = "info@wispr.hospital"

export interface OutboxMessage {
  leadId: string
  to: string
  from: string
  subject: string
  body: string
  code: string
  createdAt: string
}

let queue: Promise<unknown> = Promise.resolve()

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readAll(): Promise<OutboxMessage[]> {
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as unknown
    return Array.isArray(parsed) ? (parsed as OutboxMessage[]) : []
  } catch {
    return []
  }
}

async function writeAll(messages: OutboxMessage[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(messages, null, 2), "utf8")
}

export function recordLeadCode(leadId: string, email: string, purpose: "query" | "application" = "query"): Promise<string> {
  return withLock(async () => {
    const messages = await readAll()
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const subject = purpose === "application" ? `Your listing application ${leadId}` : `Your query id is ${leadId}`
    const body = purpose === "application"
      ? `Your application id is ${leadId}. Your email code is ${code}. This is not a patient query and is not sent to a city desk.`
      : `Your unique id is ${leadId}. Your email code is ${code}. Return to the site and enter this code to continue.`
    const message: OutboxMessage = {
      leadId,
      to: email,
      from: FROM,
      subject,
      body,
      code,
      createdAt: new Date().toISOString(),
    }
    const next = [message, ...messages.filter((item) => item.leadId !== leadId)]
    await writeAll(next)
    // Real delivery when configured; outbox remains the source of truth for verification.
    await sendTransactionalMail({ to: email, subject, text: body })
    return code
  })
}

/** Latest OTP for a lead — used only by the local demo helper in outbox mode. */
export function getLatestLeadCode(leadId: string): Promise<string | null> {
  return withLock(async () => {
    const message = (await readAll()).find((item) => item.leadId === leadId)
    return message?.code ?? null
  })
}

export function verifyLeadCode(leadId: string, code: string): Promise<boolean> {
  return withLock(async () => {
    const message = (await readAll()).find((item) => item.leadId === leadId)
    return message?.code === code.trim()
  })
}

export function recordLeadConfirmation(leadId: string, email: string, track: string): Promise<void> {
  return withLock(async () => {
    const label = track === "camp" ? "free medical camp" : track === "surgery" ? "free surgery" : "free consultation"
    const messages = await readAll()
    const message: OutboxMessage = {
      leadId: `${leadId}:confirm`,
      to: email,
      from: FROM,
      subject: `We have your request ${leadId}`,
      body: `We have your ${label} request. Your unique id is ${leadId}. Our team has received it and will be in touch. It was not sent to a hospital or a doctor.`,
      code: "",
      createdAt: new Date().toISOString(),
    }
    const next = [message, ...messages.filter((item) => item.leadId !== message.leadId)]
    await writeAll(next)
    await sendTransactionalMail({ to: email, subject: message.subject, text: message.body })
  })
}

export function listOutbox(): Promise<OutboxMessage[]> {
  return withLock(async () => readAll())
}

export function forgetLeadCode(leadId: string): Promise<void> {
  return withLock(async () => {
    const messages = await readAll()
    await writeAll(messages.filter((item) => item.leadId !== leadId && item.leadId !== `${leadId}:confirm`))
  })
}
