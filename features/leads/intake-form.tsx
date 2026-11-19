"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { whatsappHref } from "@/constants/site-contact"
import type { Lead, LeadAudience, LeadCity, LeadEmbassy, LeadTrack } from "@/lib/leads/types"
import { cn } from "@/lib/utils"

const TRACKS: { id: LeadTrack; label: string; prompt: string }[] = [
  { id: "consultation", label: "Free consultation", prompt: "What would you like to ask?" },
  { id: "camp", label: "Attend free medical camp", prompt: "Which camp or date should the desk know about?" },
  { id: "surgery", label: "Apply for free surgery", prompt: "Which surgery are you asking about?" },
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
  const [pending, setPending] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [detail, setDetail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpNote, setOtpNote] = useState<string | null>(null)

  async function chooseTrack(track: LeadTrack) {
    if (!lead) return
    setTrackError(null)
    const response = await fetch(`/api/leads/${lead.id}`, {
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
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)
    const response = await fetch("/api/leads", {
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
    setPending(false)
    if (!response.ok || !payload?.lead) {
      setError(payload?.error ?? "Could not save your request.")
      return
    }
    setLead(payload.lead)
  }

  if (lead) {
    const trackLabel = TRACKS.find((item) => item.id === lead.track)?.label
    const message = [
      `Query ${lead.id}`,
      trackLabel,
      lead.name,
      lead.email,
      lead.phone ? `Phone: ${lead.phone}` : null,
      `City: ${lead.preferredCity}`,
      lead.comment ? lead.comment : null,
      lead.detail ? lead.detail : null,
    ]
      .filter(Boolean)
      .join("\n")
    return (
      <Card
        className={cn(
          isHero &&
            "rounded-2xl border border-cta/25 bg-linear-to-br from-primary via-primary to-cta text-primary-foreground shadow-xl ring-1 ring-white/10 sm:p-5 [&_input]:border-white/25 [&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-foreground/45 [&_textarea]:border-white/25 [&_textarea]:bg-white [&_textarea]:text-foreground [&_textarea]:placeholder:text-foreground/45",
        )}
      >
        <CardHeader>
          <CardTitle className={cn(isHero && "text-primary-foreground")}>Your unique id is {lead.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className={cn(isHero ? "text-primary-foreground/85" : "text-muted-foreground")}>
            {lead.emailVerified
              ? `Choose one request. It goes to our admin team and the ${lead.preferredCity === "delhi" ? "Delhi" : "Indore"} desk, not to a hospital or a doctor.`
              : `We sent a 6-digit code to ${lead.email}. Enter it below to continue. The mail comes from info@wispr.hospital.`}
          </p>
          {!lead.emailVerified ? (
            <form
              className="space-y-2"
              onSubmit={async (event) => {
                event.preventDefault()
                setOtpNote(null)
                const response = await fetch(`/api/leads/${lead.id}`, {
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
              }}
            >
              <Label htmlFor="lead-otp" className={cn(isHero && "text-primary-foreground")}>Email code</Label>
              <Input id="lead-otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6-digit code" />
              <p className={cn("text-xs", isHero ? "text-primary-foreground/80" : "text-muted-foreground")}>Email verification is required. You cannot choose a request or send details until the code matches.</p>
              <Button type="submit" variant={isHero ? "secondary" : "outline"} className={cn("rounded-full", isHero && "border-0 bg-white text-cta hover:bg-secondary")}>Check code</Button>
            </form>
          ) : null}
          {otpNote ? <p className={cn("text-sm", otpNote === "Email checked." ? (isHero ? "text-primary-foreground/90" : "text-muted-foreground") : "text-destructive")}>{otpNote}</p> : null}
          {lead.emailVerified ? (
            <div className="flex flex-col gap-2">
              {TRACKS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={isHero ? (lead.track === item.id ? "secondary" : "outline") : (lead.track === item.id ? "cta" : "outline")}
                  className={cn("justify-start rounded-full", isHero && lead.track !== item.id && "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground", isHero && lead.track === item.id && "border-0 bg-white text-cta hover:bg-white")}
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
              className="space-y-2"
              onSubmit={async (event) => {
                event.preventDefault()
                setTrackError(null)
                const response = await fetch(`/api/leads/${lead.id}`, {
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
              }}
            >
              <Label htmlFor="lead-detail" className={cn(isHero && "text-primary-foreground")}>{TRACKS.find((item) => item.id === lead.track)?.prompt}</Label>
              <Textarea id="lead-detail" value={detail} onChange={(event) => setDetail(event.target.value)} rows={3} />
              <Button type="submit" variant={isHero ? "secondary" : "outline"} className={cn("rounded-full", isHero && "border-0 bg-white text-cta hover:bg-secondary")}>Save this detail</Button>
            </form>
          ) : null}
          {lead.emailVerified && lead.track ? (
            <Button
              variant={isHero ? "secondary" : "cta"}
              className={cn("rounded-full", isHero && "border-0 bg-white text-cta shadow-md hover:bg-secondary")}
              render={<a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" />}
            >
              Send this on WhatsApp
            </Button>
          ) : null}
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
          <p className="text-sm leading-relaxed text-primary-foreground/85">
            Share your details — we will verify your email, then you can choose a consultation, a camp, or surgery.
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={cn("flex flex-col", isHero ? "gap-3.5" : "gap-4")} noValidate>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name" className={heroLabels}>Name</Label>
              <Input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className={heroLabels}>Email</Label>
              <Input id="lead-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className={cn("text-sm font-medium", isHero && "text-primary-foreground")}>You are</legend>
            <div className="flex gap-2">
              {(["indian", "others"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={isHero ? "secondary" : "cta"}
                  className={cn(
                    "rounded-full",
                    isHero && (audience === option
                      ? "border-0 bg-white text-cta hover:bg-white"
                      : "border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"),
                  )}
                  onClick={() => setAudience(option)}
                >
                  {option === "indian" ? "Indian" : "Others"}
                </Button>
              ))}
            </div>
          </fieldset>

          {audience === "indian" ? (
            <div className="space-y-1.5">
              <Label htmlFor="lead-state" className={heroLabels}>State</Label>
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
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="lead-embassy" className={heroLabels}>Embassy</Label>
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
          )}

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

          <div className="space-y-1.5">
            <Label htmlFor="lead-phone" className={heroLabels}>Mobile number (optional)</Label>
            <Input id="lead-phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-comment" className={heroLabels}>Comment</Label>
            <Textarea
              id="lead-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write your mobile number and your query, if any."
              rows={4}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="submit"
            variant={isHero ? "secondary" : "cta"}
            className={cn(
              "font-semibold",
              isHero
                ? "w-full rounded-lg border-0 bg-white px-6 text-cta shadow-md hover:bg-secondary"
                : "rounded-full",
            )}
            disabled={pending}
          >
            {pending ? "Submitting…" : isHero ? "Continue →" : "Submit"}
          </Button>
          {isHero ? (
            <p className="text-center text-xs leading-relaxed text-primary-foreground/80">
              By submitting you agree to our Terms and Privacy Policy. Your query goes to our admin and the Delhi or Indore desk — never to a hospital or a doctor.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
