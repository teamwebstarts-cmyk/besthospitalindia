"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Lead, LeadStatus } from "@/lib/leads/types"

const STATUSES: LeadStatus[] = ["new", "contacted", "closed"]

function trackLabel(lead: Lead): string {
  if (lead.track === "camp") return "Medical camp"
  if (lead.track === "surgery") return "Surgery"
  if (lead.track === "consultation") return "Consultation"
  return "Not chosen"
}

function deskLabel(lead: Lead): string {
  if (!lead.vendorId) return "No active desk"
  return lead.preferredCity === "delhi" ? "Delhi desk" : "Indore desk"
}

function regionLabel(lead: Lead): string {
  return lead.audience === "indian" ? (lead.state ?? "—") : `Embassy · ${lead.embassy ?? "—"}`
}

export function AdminLeads({
  initialLeads,
  emailCodes,
}: {
  initialLeads: Lead[]
  emailCodes: Record<string, string>
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(id: string, status: LeadStatus) {
    setError(null)
    const response = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
    if (!response.ok || !payload?.lead) {
      setError(payload?.error ?? "Could not update the lead.")
      return
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? payload.lead! : lead)))
  }

  async function remove(id: string) {
    setError(null)
    const response = await fetch(`/api/leads/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setError("Could not delete the lead.")
      return
    }
    setLeads((current) => current.filter((lead) => lead.id !== id))
  }

  if (leads.length === 0) {
    return <p className="text-sm text-muted-foreground">No queries yet.</p>
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="grid gap-3 lg:grid-cols-2">
        {leads.map((lead) => (
          <li key={lead.id}>
            <Card className="h-full border-border/70 shadow-none">
              <CardContent className="flex h-full flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="font-heading text-base font-semibold text-foreground">{lead.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{lead.id}</p>
                  </div>
                  <select
                    className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                    value={lead.status}
                    onChange={(event) => setStatus(lead.id, event.target.value as LeadStatus)}
                    aria-label={`Status for ${lead.name}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{trackLabel(lead)}</Badge>
                  <Badge variant="outline">{deskLabel(lead)}</Badge>
                  <Badge variant="outline">{regionLabel(lead)}</Badge>
                  <Badge variant={lead.emailVerified ? "default" : "secondary"}>
                    {lead.emailVerified ? "Email verified" : "Email pending"}
                  </Badge>
                </div>

                <dl className="grid gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Contact</dt>
                    <dd className="text-foreground">
                      {lead.email}
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </dd>
                  </div>
                  {lead.comment ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Comment</dt>
                      <dd className="line-clamp-3 text-foreground">{lead.comment}</dd>
                    </div>
                  ) : null}
                  {lead.detail ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Detail</dt>
                      <dd className="line-clamp-4 text-foreground">{lead.detail}</dd>
                    </div>
                  ) : null}
                  {emailCodes[lead.id] ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">OTP (demo)</dt>
                      <dd className="font-mono text-xs text-muted-foreground">{emailCodes[lead.id]}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-auto flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(lead.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}