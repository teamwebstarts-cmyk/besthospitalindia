import { env } from "node:process"

/**
 * Transactional mail delivery for Best Hospital India.
 *
 * Priority order:
 *  1. Resend HTTP API  (RESEND_API_KEY)         - recommended, best deliverability
 *  2. Generic SMTP     (SMTP_HOST + SMTP_USER/Pass) - any SMTP relay / self-hosted
 *  3. Local outbox log                          - dev/test only, no credentials
 *
 * Resend SMTP (smtp.resend.com) also works via option 2 if you prefer SMTP.
 */

const MAIL_FROM = env.MAIL_FROM || "Best Hospital India <info@wispr.hospital>"
const RESEND_API = "https://api.resend.com/emails"
const SMTP_PORT = Number(env.SMTP_PORT || 587)

export interface MailMessage {
  to: string
  subject: string
  text: string
}

function hasResend(): boolean {
  return Boolean(env.RESEND_API_KEY)
}

function hasSmtp(): boolean {
  return Boolean(env.SMTP_HOST && SMTP_PORT && env.SMTP_USER && env.SMTP_PASS)
}

async function sendViaResend(message: MailMessage): Promise<boolean> {
  try {
    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    })
    if (!response.ok) {
      console.error("[mail] Resend rejected:", response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error("[mail] Resend failed:", error)
    return false
  }
}

async function sendViaSmtp(message: MailMessage): Promise<boolean> {
  try {
    const nodemailer = await import("nodemailer")
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
    await transport.sendMail({
      from: MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
    })
    transport.close()
    return true
  } catch (error) {
    console.error("[mail] SMTP failed:", error)
    return false
  }
}

/**
 * Returns true when the message was delivered by a real provider.
 * Returns false when no provider is configured (caller should still log to outbox).
 */
export async function sendTransactionalMail(message: MailMessage): Promise<boolean> {
  if (hasResend() && (await sendViaResend(message))) return true
  if (hasSmtp() && (await sendViaSmtp(message))) return true
  return false
}

export function mailProvider(): "resend" | "smtp" | "outbox" {
  if (hasResend()) return "resend"
  if (hasSmtp()) return "smtp"
  return "outbox"
}
