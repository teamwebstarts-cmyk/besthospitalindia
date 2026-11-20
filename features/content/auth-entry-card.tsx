"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { BuildingIcon, StethoscopeIcon } from "lucide-react"

import { PartnerInterestForm } from "@/features/content/partner-forms"
import { PartnerEmailOtpInline } from "@/features/partner/partner-email-otp-inline"
import { PartnerDashboard } from "@/features/partner/partner-dashboard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"
import { cn } from "@/lib/utils"

type PartnerRole = "hospital" | "doctor"
type Mode = "signin" | "apply"

const roles: readonly {
  id: PartnerRole
  label: string
  hint: string
  icon: typeof BuildingIcon
}[] = [
  { id: "hospital", label: "Hospital", hint: "Facility listing", icon: BuildingIcon },
  { id: "doctor", label: "Doctor", hint: "Profile listing", icon: StethoscopeIcon },
]

export interface AuthEntryCardProps {
  className?: string
  defaultRole?: PartnerRole
}

export function AuthEntryCard({ className, defaultRole = "hospital" }: AuthEntryCardProps) {
  const [role, setRole] = useState<PartnerRole>(defaultRole)
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [signInOtp, setSignInOtp] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { pending, slow, run } = useAsyncAction()

  useEffect(() => {
    let cancelled = false
    void fetchResilient("/api/partner/session")
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { session?: { email: string; kind: string } | null }
        if (!cancelled && payload?.session) {
          setHasSession(true)
          setEmail(payload.session.email)
          if (payload.session.kind === "hospital" || payload.session.kind === "doctor") {
            setRole(payload.session.kind)
          }
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (!emailVerified || signInOtp.trim().length < 6) {
      setError("Verify your email with the code we sent.")
      return
    }
    try {
      const response = await run(async () =>
        fetchResilient("/api/partner/session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim(), kind: role, otp: signInOtp.trim() }),
        }),
      )
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setError(payload?.error ?? "Could not sign in.")
        return
      }
      setHasSession(true)
      setSignInOtp("")
    } catch {
      setError("Server is waking up—please wait and try again.")
    }
  }

  if (hasSession) {
    return (
      <div className={cn("mx-auto w-full max-w-3xl space-y-5", className)}>
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Partner access</h1>
          <p className="text-sm text-muted-foreground">
            Hospitals and doctors only — check status, add listings, edit details. No appointments dashboard.
          </p>
        </div>
        <PartnerDashboard
          onSignedOut={() => {
            setHasSession(false)
            setEmailVerified(false)
          }}
        />
        <p className="text-center text-xs text-muted-foreground">
          Patients:{" "}
          <Link href="/free-consultation" className="text-primary underline-offset-4 hover:underline">
            request a consultation
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-5", className)}>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Partner access</h1>
        <p className="text-sm text-muted-foreground">Hospitals and doctors only. Patients book without an account.</p>
      </div>

      <div role="radiogroup" aria-label="Partner type" className="grid grid-cols-2 gap-2">
        {roles.map((entry) => {
          const selected = role === entry.id
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setRole(entry.id)
                setError(null)
                setEmailVerified(false)
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary/60 bg-primary/5 text-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <entry.icon aria-hidden className={cn("size-5 shrink-0", selected ? "text-primary" : "")} />
              <span>
                <span className="block text-sm font-semibold text-foreground">{entry.label}</span>
                <span className="block text-xs">{entry.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex rounded-lg border bg-muted/40 p-1">
        {(["signin", "apply"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item)
              setError(null)
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === item ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item === "signin" ? "Sign in" : "Apply"}
          </button>
        ))}
      </div>

      {mode === "signin" ? (
        <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
          <form className="space-y-4" onSubmit={signIn}>
            <div className="space-y-1.5">
              <Label htmlFor="partner-email">Official email</Label>
              <Input
                id="partner-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setEmailVerified(false)
                  setSignInOtp("")
                }}
                required
              />
            </div>
            <PartnerEmailOtpInline
              email={email}
              purpose="signin"
              verified={emailVerified}
              onVerifiedChange={setEmailVerified}
              onOtpConfirmed={setSignInOtp}
            />
            <AsyncWaitBanner visible={pending} slow={slow} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <PendingButton
              type="submit"
              pending={pending}
              pendingLabel="Signing in…"
              className="w-full"
              disabled={!emailVerified || signInOtp.trim().length < 6}
            >
              {`Sign in as ${role}`}
            </PendingButton>
            <p className="text-xs text-muted-foreground">
              Sign-in is official email plus a one-time code (no password). After sign-in you can check approval status,
              add more listings, and edit details — edits to approved listings go back to admin for approval.
            </p>
          </form>
        </section>
      ) : (
        <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
          <PartnerInterestForm key={role} kind={role} compact />
        </section>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Patients:{" "}
        <Link href="/free-consultation" className="text-primary underline-offset-4 hover:underline">
          request a consultation
        </Link>
      </p>
    </div>
  )
}