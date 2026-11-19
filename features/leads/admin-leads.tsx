"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Lead, LeadStatus } from "@/lib/leads/types"

const STATUSES: LeadStatus[] = ["new", "contacted", "closed"]

export function AdminLeads({ initialLeads }: { initialLeads: Lead[] }) {
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
    return <p className="text-sm text-muted-foreground">No queries yet. New submissions from the free consultation form appear here and with the city vendor.</p>
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-3">
        {leads.map((lead) => (
          <li key={lead.id}>
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1 text-sm">
                  <p className="font-semibold text-foreground">{lead.name} · {lead.id}</p>
                  <p className="text-muted-foreground">{lead.email}{lead.phone ? ` · ${lead.phone}` : ""}</p>
                  <p className="text-muted-foreground">
                    {lead.track === "camp" ? "Free medical camp" : lead.track === "surgery" ? "Free surgery" : lead.track === "consultation" ? "Free consultation" : "Request not chosen"}
                    {" · "}
                    {lead.preferredCity === "delhi" ? "Delhi vendor" : "Indore vendor"}
                    {" · "}
                    {lead.audience === "indian" ? lead.state : `Embassy of ${lead.embassy}`}
                  </p>
                  {lead.comment ? <p>{lead.comment}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={lead.status}
                    onChange={(event) => setStatus(lead.id, event.target.value as LeadStatus)}
                    aria-label={`Status for ${lead.name}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
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
