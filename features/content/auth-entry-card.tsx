"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BuildingIcon, StethoscopeIcon } from "lucide-react"

import { PartnerInterestForm } from "@/features/content/partner-forms"
import { SubmissionStatus } from "@/features/catalogue/submission-status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { ROUTES } from "@/constants/routes"
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
  const router = useRouter()
  const [role, setRole] = useState<PartnerRole>(defaultRole)
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { pending, slow, run } = useAsyncAction()

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setError(null)
    type SubmissionsPayload = {
      submissions?: { kind: string; status: string }[]
      error?: string
    }
    let payload: SubmissionsPayload | null = null
    let response: Response
    try {
      response = await run(async () =>
        fetchResilient(`/api/catalogue/submissions?email=${encodeURIComponent(email)}`),
      )
      payload = (await response.json().catch(() => null)) as SubmissionsPayload | null
    } catch {
      setError("Server is waking up—please wait and try again.")
      return
    }
    if (!response.ok) {
      setError(payload?.error ?? "Could not check that email.")
      return
    }
    const mine = (payload?.submissions ?? []).filter((row) => row.kind === role)
    const demoEmail =
      role === "hospital" ? "hospital@besthospitalindian.com" : "doctor@besthospitalindian.com"
    if (mine.some((row) => row.status === "approved") || email.trim().toLowerCase() === demoEmail) {
      router.push(role === "hospital" ? ROUTES.hospitalPortal.dashboard : ROUTES.doctorPortal.dashboard)
      return
    }
    if (mine.some((row) => row.status === "pending")) {
      setError("This listing is waiting for admin approval.")
      setMode("apply")
      return
    }
    if (mine.some((row) => row.status === "rejected")) {
      setError("This listing was not approved. Submit again if the details changed.")
      setMode("apply")
      return
    }
    setError("No listing for this email yet. Apply below.")
    setMode("apply")
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
          <form className="space-y-3" onSubmit={signIn}>
            <div className="space-y-1.5">
              <Label htmlFor="partner-email">Official email</Label>
              <Input
                id="partner-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partner-password">Password</Label>
              <Input
                id="partner-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
            <AsyncWaitBanner visible={pending} slow={slow} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <PendingButton type="submit" pending={pending} pendingLabel="Checking…" className="w-full">
              {`Sign in as ${role}`}
            </PendingButton>
          </form>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
            <PartnerInterestForm key={role} kind={role} compact />
          </section>
          <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Check approval</h2>
            <SubmissionStatus compact />
          </section>
        </>
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