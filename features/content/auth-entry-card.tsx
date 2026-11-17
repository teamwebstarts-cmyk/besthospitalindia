"use client"

import { useState } from "react"
import Link from "next/link"
import { BuildingIcon, StethoscopeIcon, UserRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface AuthEntryCardProps {
  className?: string
}

type Role = "patient" | "hospital" | "doctor"
type Mode = "sign-in" | "register"
type Step = "credentials" | "otp" | "verified"

const roles: readonly {
  id: Role
  label: string
  description: string
  icon: typeof UserRoundIcon
}[] = [
  {
    id: "patient",
    label: "Patient",
    description: "Find providers, raise enquiries and track requests.",
    icon: UserRoundIcon,
  },
  {
    id: "hospital",
    label: "Hospital partner",
    description: "Manage your facility profile, enquiries and documents.",
    icon: BuildingIcon,
  },
  {
    id: "doctor",
    label: "Doctor partner",
    description: "Manage your profile, consultations and credentials.",
    icon: StethoscopeIcon,
  },
]

function isValidIdentifier(value: string): boolean {
  const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const looksPhone = /^\+?[\d\s\-().]{7,20}$/.test(value)
  return looksEmail || looksPhone
}

/**
 * Role-aware auth entry card (19-auth). Patient flow is an email/mobile OTP
 * concept: local state only, a mock 6-digit code revealed inline (no SMS/email
 * exists), and an in-page demo "verified" state after OTP entry — the patient
 * portal is a future phase, so there is intentionally no navigation target
 * (A15 / BUG-010). Hospital/doctor roles expose registration entry points
 * only. Nothing is sent anywhere.
 */
export function AuthEntryCard({ className }: AuthEntryCardProps) {
  const [role, setRole] = useState<Role>("patient")
  const [mode, setMode] = useState<Mode>("sign-in")
  const [step, setStep] = useState<Step>("credentials")
  const [identifier, setIdentifier] = useState("")
  const [identifierError, setIdentifierError] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [issuedOtp, setIssuedOtp] = useState<string | null>(null)

  function resetOtpFlow() {
    setStep("credentials")
    setIssuedOtp(null)
    setOtp("")
    setOtpError(null)
    setIdentifierError(null)
  }

  function handleIdentifierSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValidIdentifier(identifier.trim())) {
      setIdentifierError("Enter a valid email address or mobile number.")
      return
    }
    setIdentifierError(null)
    // Mock OTP issuance: the "sent" code is revealed inline because nothing is delivered.
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setIssuedOtp(code)
    setOtp("")
    setOtpError(null)
    setStep("otp")
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (issuedOtp === null) {
      setOtpError("No code was issued yet. Go back and request one.")
      return
    }
    if (otp.trim() !== issuedOtp) {
      setOtpError(
        "Incorrect code. Check the demo code shown above and try again."
      )
      return
    }
    setOtpError(null)
    // Mock sign-in success: show the local demo-verified state. The patient /
    // partner portals are future phases (A09+), so there is intentionally no
    // redirect target yet — navigating to /patient would 404 (BUG-010).
    setStep("verified")
  }

  const activeRole = roles.find((entry) => entry.id === role) ?? roles[0]

  return (
    <div className={cn("mx-auto w-full max-w-lg space-y-5", className)}>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {mode === "sign-in"
            ? "Sign in to BestHospitalIndia"
            : "Create your access"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Demo authentication — choose a role to continue. Nothing is sent or
          stored.
        </p>
      </div>

      {/* Role selector */}
      <div
        role="radiogroup"
        aria-label="Account role"
        className="grid gap-2 sm:grid-cols-3"
      >
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
                resetOtpFlow()
              }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary/60 bg-primary/5 text-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <entry.icon
                aria-hidden
                className={cn(
                  "size-5",
                  selected ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-semibold">{entry.label}</span>
              <span className="text-xs leading-snug">{entry.description}</span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
        {role === "patient" ? (
          step === "credentials" ? (
            <form
              onSubmit={handleIdentifierSubmit}
              noValidate
              className="space-y-4"
              aria-label="Patient sign in"
            >
              <div className="space-y-1.5">
                <Label htmlFor="auth-identifier">Email or mobile number</Label>
                <Input
                  id="auth-identifier"
                  name="identifier"
                  type="text"
                  inputMode="email"
                  placeholder="name@example.com or +91 …"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value)
                    setIdentifierError(null)
                  }}
                  aria-invalid={identifierError ? true : undefined}
                  aria-describedby={
                    identifierError ? "auth-identifier-error" : undefined
                  }
                />
                {identifierError ? (
                  <p
                    id="auth-identifier-error"
                    className="text-xs font-medium text-destructive"
                  >
                    {identifierError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" variant="cta" className="w-full rounded-full font-semibold shadow-sm">
                Send one-time code (demo)
              </Button>
              <p className="text-xs text-muted-foreground">
                A 6-digit code would be sent to this email or mobile. In this
                demo the code is shown on the next screen — no message is
                actually sent.
              </p>
            </form>
          ) : step === "otp" ? (
            <form
              onSubmit={handleOtpSubmit}
              noValidate
              className="space-y-4"
              aria-label="One-time code"
            >
              <div className="space-y-1.5">
                <Label htmlFor="auth-otp">One-time code</Label>
                <Input
                  id="auth-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    setOtpError(null)
                  }}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={
                    otpError ? "auth-otp-error" : "auth-otp-hint"
                  }
                />
                {otpError ? (
                  <p
                    id="auth-otp-error"
                    className="text-xs font-medium text-destructive"
                  >
                    {otpError}
                  </p>
                ) : (
                  <p
                    id="auth-otp-hint"
                    className="text-xs text-muted-foreground"
                  >
                    Demo code (would normally arrive by SMS/email):{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {issuedOtp}
                    </span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("credentials")
                    setIssuedOtp(null)
                    setOtp("")
                    setOtpError(null)
                  }}
                >
                  Change email / mobile
                </Button>
                <Button type="submit" variant="cta" className="flex-1 rounded-full font-semibold shadow-sm">
                  Verify & continue
                </Button>
              </div>
            </form>
          ) : (
            <div
              className="space-y-4 text-center"
              aria-label="Demo verification result"
              aria-live="polite"
            >
              <UserRoundIcon
                aria-hidden
                className="mx-auto size-8 text-primary"
              />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Demo sign-in verified
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The code matched — this “verified” state lives only in this
                  page’s local memory. The patient portal (dashboard,
                  appointments, enquiries) is a future phase and does not exist
                  in this demo build, so there is nowhere to navigate yet.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetOtpFlow()
                    setIdentifier("")
                  }}
                >
                  Start over
                </Button>
                <Button
                  render={
                    <Link href="/" />
                  }
                >
                  Back to homepage
                </Button>
              </div>
            </div>
          )
        ) : (
          <div
            className="space-y-4 text-center"
            aria-label={`${activeRole.label} registration entry`}
          >
            <activeRole.icon
              aria-hidden
              className="mx-auto size-8 text-primary"
            />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                {activeRole.label} access is part of the partner portal
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {role === "hospital"
                  ? "Hospital partners register through the institutional interest flow. Submit the hospital interest form and the demo portal team takes it from there — no account is created here."
                  : "Individual doctors register through the doctor interest flow. Submit the doctor interest form to start the demo verification conversation — no account is created here."}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                render={
                  <a
                    href={
                      role === "hospital"
                        ? "/for-hospitals#interest-form"
                        : "/for-doctors#interest-form"
                    }
                  />
                }
              >
                {role === "hospital"
                  ? "Go to hospital interest form"
                  : "Go to doctor interest form"}
              </Button>
              <Button variant="outline" onClick={() => setRole("patient")}>
                Continue as patient instead
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mode switch + demo boundary */}
      <div className="space-y-3 text-center">
        {role === "patient" ? (
          <p className="text-sm text-muted-foreground">
            {mode === "sign-in"
              ? "New to BestHospitalIndia?"
              : "Already have access?"}{" "}
            <button
              type="button"
              className="rounded font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => {
                setMode(mode === "sign-in" ? "register" : "sign-in")
                resetOtpFlow()
              }}
            >
              {mode === "sign-in" ? "Create patient access" : "Sign in instead"}
            </button>
          </p>
        ) : null}
        <p className="rounded-lg border border-dashed px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Mock-only notice: this page demonstrates the auth concept. There is no
          real authentication, no SMS/email delivery, no account storage, and
          the “verified” state lives only in this page’s local memory until you
          navigate away.
        </p>
      </div>
    </div>
  )
}
