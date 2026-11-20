"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"
import type { Lead, LeadAudience, LeadCity, LeadEmbassy, LeadTrack } from "@/lib/leads/types"
import { cn } from "@/lib/utils"

const TRACKS: { id: LeadTrack; label: string; prompt: string; placeholder: string }[] = [
  {
    id: "consultation",
    label: "Free consultation",
    prompt: "What would you like to ask?",
    placeholder: "e.g. symptoms, specialist, or second opinion",
  },
  {
    id: "camp",
    label: "Attend free medical camp",
    prompt: "Which camp or date should the desk know about?",
    placeholder: "Camp name, city, or preferred date",
  },
  {
    id: "surgery",
    label: "Apply for free surgery",
    prompt: "Which surgery are you asking about?",
    placeholder: "Procedure name and brief medical background",
  },
]

const STATES = [
  "Delhi",
  "Maharashtra",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Rajasthan",
  "Gujarat",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "West Bengal",
  "Punjab",
  "Haryana",
  "Bihar",
  "Telangana",
  "Other",
] as const

export function LeadIntakeForm({ variant = "card" }: { variant?: "card" | "hero" }) {
  const isHero = variant === "hero"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [comment, setComment] = useState("")
  const [audience, setAudience] = useState<LeadAudience>("indian")
  const [stateName, setStateName] = useState("")
  const [embassy, setEmbassy] = useState<LeadEmbassy | "">("")
  const [preferredCity, setPreferredCity] = useState<LeadCity | "">("")
  const [error, setError] = useState<string | null>(null)
  const submitAction = useAsyncAction()
  const otpAction = useAsyncAction()
  const detailAction = useAsyncAction()
  const trackAction = useAsyncAction()
  const [lead, setLead] = useState<Lead | null>(null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [detail, setDetail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpNote, setOtpNote] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function chooseTrack(track: LeadTrack) {
    if (!lead) return
    setTrackError(null)
    await trackAction.run(async () => {
      const response = await fetchResilient(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ track }),
      })
      const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
      if (!response.ok || !payload?.lead) {
        setTrackError(payload?.error ?? "Could not save that choice.")
        return
      }
      setLead(payload.lead)
    }).catch(() => setTrackError("Server is slow to respond. Try again in a moment."))
  }

  function resetIntake() {
    setLead(null)
    setSubmitted(false)
    setName("")
    setEmail("")
    setPhone("")
    setComment("")
    setAudience("indian")
    setStateName("")
    setEmbassy("")
    setPreferredCity("")
    setError(null)
    setTrackError(null)
    setDetail("")
    setOtp("")
    setOtpNote(null)
  }

  const anyPending =
    submitAction.pending || otpAction.pending || detailAction.pending || trackAction.pending
  const anySlow = submitAction.slow || otpAction.slow || detailAction.slow || trackAction.slow

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (anyPending) return
    setError(null)
    await submitAction.run(async () => {
      const response = await fetchResilient("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          comment,
          audience,
          state: stateName,
          embassy,
          preferredCity,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
      if (!response.ok || !payload?.lead) {
        setError(payload?.error ?? "Could not save your request.")
        return
      }
      setLead(payload.lead)
    }).catch(() => setError("Server is waking up—please wait and try again."))
  }

  if (lead) {
    return (
      <Card
        className={cn(
          isHero &&
            "rounded-2xl border border-cta/25 bg-linear-to-br from-primary via-primary to-cta text-primary-foreground shadow-xl ring-1 ring-white/10 sm:p-5 [&_input]:border-white/25 [&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-foreground/45 [&_textarea]:border-white/25 [&_textarea]:bg-white [&_textarea]:text-foreground [&_textarea]:placeholder:text-foreground/45",
        )}
      >
        <CardContent
          className={cn(
            "space-y-3.5 text-sm",
            (submitted || isHero) && "pt-(--card-spacing)",
            !submitted && !isHero && "pt-0",
          )}
        >
          <AsyncWaitBanner visible={anyPending && !submitted} slow={anySlow} />
          {submitted ? (
            <div
              className={cn(
                "space-y-4",
                isHero
                  ? "rounded-xl bg-white p-4 text-foreground shadow-sm ring-1 ring-white/30"
                  : "rounded-xl border border-border/70 bg-card p-4 shadow-sm",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    isHero ? "bg-primary/10 text-primary" : "bg-success/10 text-success",
                  )}
                  aria-hidden
                >
                  <CheckCircle2Icon className="size-6" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="text-base font-semibold tracking-tight text-foreground">Request received</p>
                  <p className="text-sm leading-snug text-muted-foreground">
                    We have your details. A confirmation will be sent to{" "}
                    <span className="font-medium text-foreground">{lead.email}</span>.
                  </p>
                </div>
              </div>
              <dl className="grid gap-2.5 border-t border-border/60 pt-3 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="font-semibold tabular-nums text-foreground">{lead.id}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Request</dt>
                  <dd className="text-right font-medium text-foreground">
                    {TRACKS.find((item) => item.id === lead.track)?.label ?? "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Preferred city</dt>
                  <dd className="font-medium capitalize text-foreground">{lead.preferredCity}</dd>
                </div>
              </dl>
              <Button
                type="button"
                variant={isHero ? "outline" : "secondary"}
                className={cn("h-10 w-full rounded-lg font-semibold", isHero && "border-border text-cta hover:bg-muted/50")}
                onClick={resetIntake}
              >
                Submit another request
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className={cn("text-base font-semibold tracking-tight", isHero && "text-primary-foreground")}>
                  Your reference is{" "}
                  <span className="tabular-nums">{lead.id}</span>
                </p>
                <p className={cn(isHero ? "text-primary-foreground/85" : "text-muted-foreground")}>
                  {lead.emailVerified
                    ? "Choose what you would like to do next:"
                    : `We sent a 6-digit code to ${lead.email}. Enter it below to continue.`}
                </p>
              </div>
              {!lead.emailVerified ? (
                <form
                  className="space-y-2"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setOtpNote(null)
                    await otpAction.run(async () => {
                      const response = await fetchResilient(`/api/leads/${lead.id}`, {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ otp }),
                      })
                      const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
                      if (!response.ok || !payload?.lead) {
                        setOtpNote(payload?.error ?? "That code does not match.")
                        return
                      }
                      setLead(payload.lead)
                      setOtpNote("Email checked.")
                    }).catch(() => setOtpNote("Server is slow—wait and try verifying again."))
                  }}
                >
                  <AsyncWaitBanner visible={otpAction.pending} slow={otpAction.slow} className="mb-1" />
                  <Label htmlFor="lead-otp" className={cn(isHero && "text-primary-foreground")}>Email code</Label>
                  <Input id="lead-otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6-digit code" />
                  <PendingButton
                    type="submit"
                    pending={otpAction.pending}
                    pendingLabel="Verifying…"
                    variant={isHero ? "secondary" : "outline"}
                    className={cn(
                      "w-full rounded-lg font-semibold",
                      isHero && "border-0 bg-white text-cta hover:bg-secondary",
                    )}
                  >
                    Verify code
                  </PendingButton>
                </form>
              ) : null}
              {otpNote && otpNote !== "Email checked." ? (
                <p className="text-destructive">{otpNote}</p>
              ) : null}
              {lead.emailVerified ? (
                <div className="flex flex-col gap-2">
                  {TRACKS.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={isHero ? (lead.track === item.id ? "secondary" : "outline") : (lead.track === item.id ? "cta" : "outline")}
                      className={cn(
                        "h-10 w-full justify-center rounded-lg font-medium",
                        isHero &&
                          lead.track !== item.id &&
                          "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground",
                        isHero && lead.track === item.id && "border-0 bg-white text-cta hover:bg-white",
                      )}
                      onClick={() => chooseTrack(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              ) : null}
              {trackError ? <p className="text-destructive">{trackError}</p> : null}
              {lead.emailVerified && lead.track ? (
                <form
                  className={cn(
                    "space-y-2 border-t pt-3",
                    isHero ? "border-white/20" : "border-border/60",
                  )}
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setTrackError(null)
                    await detailAction.run(async () => {
                      const response = await fetchResilient(`/api/leads/${lead.id}`, {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ detail }),
                      })
                      const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
                      if (!response.ok || !payload?.lead) {
                        setTrackError(payload?.error ?? "Could not save that detail.")
                        return
                      }
                      setLead(payload.lead)
                      setSubmitted(true)
                    }).catch(() => setTrackError("Server is slow—please try submitting again."))
                  }}
                >
                  <Label htmlFor="lead-detail" className={cn(isHero && "text-primary-foreground")}>
                    {TRACKS.find((item) => item.id === lead.track)?.prompt}
                  </Label>
                  <Textarea
                    id="lead-detail"
                    value={detail}
                    onChange={(event) => setDetail(event.target.value)}
                    rows={4}
                    placeholder={TRACKS.find((item) => item.id === lead.track)?.placeholder}
                    required
                  />
                  <PendingButton
                    type="submit"
                    pending={detailAction.pending}
                    pendingLabel="Sending…"
                    variant={isHero ? "secondary" : "outline"}
                    className={cn(
                      "h-10 w-full rounded-lg font-semibold",
                      isHero && "border-0 bg-white text-cta hover:bg-secondary",
                    )}
                  >
                    Submit request
                  </PendingButton>
                </form>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const heroLabels = isHero ? "text-primary-foreground" : undefined
  const heroSelect = isHero
    ? "h-10 w-full rounded-md border border-white/25 bg-white px-3 text-sm text-foreground placeholder:text-foreground/45"
    : "h-10 w-full rounded-md border border-input bg-background px-3 text-sm"

  return (
    <Card
      className={cn(
        isHero &&
          "rounded-2xl border border-cta/25 bg-linear-to-br from-primary via-primary to-cta text-primary-foreground shadow-xl ring-1 ring-white/10 sm:p-5 [&_input]:border-white/25 [&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-foreground/45 [&_textarea]:border-white/25 [&_textarea]:bg-white [&_textarea]:text-foreground [&_textarea]:placeholder:text-foreground/45",
      )}
    >
      <CardHeader className={cn(isHero && "space-y-1.5")}>
        <CardTitle className={cn(isHero && "flex items-center gap-2 text-lg font-semibold tracking-tight text-primary-foreground")}>
          {isHero ? (
            <>
              <svg aria-hidden className="size-5 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Let us help you
            </>
          ) : (
            "Free consultation"
          )}
        </CardTitle>
        {isHero ? (
          <p className="text-xs leading-snug text-primary-foreground/85">
            Enter your details to get started.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={cn("flex flex-col", isHero ? "gap-3.5" : "gap-4")} noValidate>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name" className={heroLabels}>Name</Label>
              <Input
                id="lead-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className={heroLabels}>Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className={cn("text-sm font-medium", isHero && "text-primary-foreground")}>
              Where are you from?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["indian", "others"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={isHero ? "secondary" : "cta"}
                  className={cn(
                    "w-full rounded-full",
                    isHero && (audience === option
                      ? "border-0 bg-white text-cta hover:bg-white"
                      : "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"),
                  )}
                  onClick={() => setAudience(option)}
                >
                  {option === "indian" ? "India" : "International"}
                </Button>
              ))}
            </div>
          </fieldset>

          {audience === "indian" ? (
            <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
              <div className="space-y-1.5">
                <Label htmlFor="lead-state" className={heroLabels}>Your state</Label>
                <select
                  id="lead-state"
                  className={heroSelect}
                  value={stateName}
                  onChange={(event) => setStateName(event.target.value)}
                  required
                >
                  <option value="">Select state</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-city" className={heroLabels}>Preferred city</Label>
                <select
                  id="lead-city"
                  className={heroSelect}
                  value={preferredCity}
                  onChange={(event) => setPreferredCity(event.target.value as LeadCity)}
                  required
                >
                  <option value="">Delhi or Indore</option>
                  <option value="delhi">Delhi</option>
                  <option value="indore">Indore</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
              <div className="space-y-1.5">
                <Label htmlFor="lead-embassy" className={heroLabels}>Your embassy</Label>
                <select
                  id="lead-embassy"
                  className={heroSelect}
                  value={embassy}
                  onChange={(event) => setEmbassy(event.target.value as LeadEmbassy)}
                  required
                >
                  <option value="">Select embassy</option>
                  <option value="kenya">Embassy of Kenya</option>
                  <option value="nepal">Embassy of Nepal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-city" className={heroLabels}>Preferred city</Label>
                <select
                  id="lead-city"
                  className={heroSelect}
                  value={preferredCity}
                  onChange={(event) => setPreferredCity(event.target.value as LeadCity)}
                  required
                >
                  <option value="">Delhi or Indore</option>
                  <option value="delhi">Delhi</option>
                  <option value="indore">Indore</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="lead-phone" className={heroLabels}>Mobile number (optional)</Label>
            <Input
              id="lead-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-comment" className={heroLabels}>Comment</Label>
            <Textarea
              id="lead-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your question or any details we should know (optional)."
              rows={4}
            />
          </div>

          <AsyncWaitBanner visible={anyPending} slow={anySlow} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <PendingButton
            type="submit"
            pending={submitAction.pending}
            pendingLabel="Submitting…"
            variant={isHero ? "secondary" : "cta"}
            className={cn(
              "font-semibold",
              isHero
                ? "w-full rounded-lg border-0 bg-white px-6 text-cta shadow-md hover:bg-secondary"
                : "rounded-full",
            )}
          >
            {isHero ? "Continue →" : "Submit"}
          </PendingButton>
        </form>
      </CardContent>
    </Card>
  )
}
