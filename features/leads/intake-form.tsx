"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { whatsappHref } from "@/constants/site-contact"
import type { Lead, LeadAudience, LeadCity, LeadEmbassy, LeadTrack } from "@/lib/leads/types"

const TRACKS: { id: LeadTrack; label: string }[] = [
  { id: "consultation", label: "Free consultation" },
  { id: "camp", label: "Attend free medical camp" },
  { id: "surgery", label: "Apply for free surgery" },
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

export function LeadIntakeForm() {
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
    ]
      .filter(Boolean)
      .join("\n")
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your unique id is {lead.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Choose one request. It goes to our admin team and the {lead.preferredCity === "delhi" ? "Delhi" : "Indore"} desk, not to a hospital or a doctor.
          </p>
          <div className="flex flex-col gap-2">
            {TRACKS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={lead.track === item.id ? "cta" : "outline"}
                className="justify-start rounded-full"
                onClick={() => chooseTrack(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {trackError ? <p className="text-destructive">{trackError}</p> : null}
          {lead.track ? (
            <Button
              variant="cta"
              className="rounded-full"
              render={<a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" />}
            >
              Send this on WhatsApp
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Free consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">Name</Label>
              <Input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">You are</legend>
            <div className="flex gap-2">
              {(["indian", "others"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={audience === option ? "cta" : "outline"}
                  className="rounded-full"
                  onClick={() => setAudience(option)}
                >
                  {option === "indian" ? "Indian" : "Others"}
                </Button>
              ))}
            </div>
          </fieldset>

          {audience === "indian" ? (
            <div className="space-y-1.5">
              <Label htmlFor="lead-state">State</Label>
              <select
                id="lead-state"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              <Label htmlFor="lead-embassy">Embassy</Label>
              <select
                id="lead-embassy"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
            <Label htmlFor="lead-city">Preferred city</Label>
            <select
              id="lead-city"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
            <Label htmlFor="lead-phone">Mobile number (optional)</Label>
            <Input id="lead-phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-comment">Comment</Label>
            <Textarea
              id="lead-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write your mobile number and your query, if any."
              rows={4}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" variant="cta" className="rounded-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
