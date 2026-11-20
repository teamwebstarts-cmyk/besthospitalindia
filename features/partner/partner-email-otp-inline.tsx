"use client"

import { useState } from "react"
import { CheckIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"
import { cn } from "@/lib/utils"

export interface PartnerEmailOtpInlineProps {
  email: string
  purpose: "register" | "signin"
  verified: boolean
  onVerifiedChange: (next: boolean) => void
  onOtpConfirmed?: (otp: string) => void
  className?: string
}

export function PartnerEmailOtpInline({
  email,
  purpose,
  verified,
  onVerifiedChange,
  onOtpConfirmed,
  className,
}: PartnerEmailOtpInlineProps) {
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [codeSent, setCodeSent] = useState(false)
  const { pending, slow, run } = useAsyncAction()

  const trimmed = email.trim()
  const canAct = trimmed.length > 3 && trimmed.includes("@")

  async function sendCode() {
    setError(null)
    setMessage(null)
    onVerifiedChange(false)
    try {
      const response = await run(async () =>
        fetchResilient("/api/partner/otp", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: trimmed, purpose, action: "send" }),
        }),
      )
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(payload?.error ?? "Could not send the code.")
        return
      }
      setCodeSent(true)
      setMessage("We sent a 6-digit code to this inbox. Enter it below.")
    } catch {
      setError("Server is waking up—please wait and try again.")
    }
  }

  async function confirmCode() {
    setError(null)
    setMessage(null)
    try {
      const response = await run(async () =>
        fetchResilient("/api/partner/otp", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: trimmed, purpose, action: "verify", otp }),
        }),
      )
      const payload = (await response.json().catch(() => null)) as { error?: string; verified?: boolean } | null
      if (!response.ok || !payload?.verified) {
        setError(payload?.error ?? "That code does not match.")
        onVerifiedChange(false)
        return
      }
      onVerifiedChange(true)
      onOtpConfirmed?.(otp.trim())
      setMessage("Email verified. You can continue.")
    } catch {
      setError("Server is waking up—please wait and try again.")
    }
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-dashed border-primary/30 bg-muted/30 p-3",
        verified && "border-primary/50 bg-primary/5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Verify official email</p>
        {verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <CheckIcon className="size-3.5" aria-hidden />
            Verified
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        We send a one-time code to the work email above. No extra page — confirm here before you submit or sign in.
      </p>
      <AsyncWaitBanner visible={pending} slow={slow} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          disabled={!canAct || pending || verified}
          onClick={() => void sendCode()}
        >
          <MailIcon className="size-3.5" aria-hidden />
          {codeSent ? "Resend code" : "Send code"}
        </Button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="partner-inline-otp" className="text-xs">
            6-digit code
          </Label>
          <Input
            id="partner-inline-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value)
              if (verified) onVerifiedChange(false)
            }}
            disabled={verified}
            maxLength={8}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          disabled={!canAct || otp.trim().length < 6 || pending || verified}
          onClick={() => void confirmCode()}
        >
          Confirm code
        </Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}