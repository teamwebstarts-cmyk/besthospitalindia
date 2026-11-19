"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Lead, LeadStatus } from "@/lib/leads/types"
import type { VendorPublic } from "@/lib/vendors/types"

const STATUSES: LeadStatus[] = ["new", "contacted", "closed"]

export function VendorDesk({ vendor, initialLeads }: { vendor: VendorPublic; initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(id: string, status: LeadStatus) {
    setError(null)
    const response = await fetch(`/api/vendor/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const payload = (await response.json().catch(() => null)) as { lead?: Lead; error?: string } | null
    if (!response.ok || !payload?.lead) {
      setError(payload?.error ?? "Could not update the query.")
      return
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? payload.lead! : lead)))
  }

  async function signOut() {
    await fetch("/api/vendor/session", { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{vendor.name}</h1>
          <p className="text-sm text-muted-foreground">
            Queries for {vendor.city === "delhi" ? "Delhi" : "Indore"} only. Hospitals and doctors do not see these.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={signOut}>Sign out</Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">No queries for your city yet.</p>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{lead.name} · {lead.id}</p>
                    <p className="text-muted-foreground">{lead.email}{lead.phone ? ` · ${lead.phone}` : ""}</p>
                    <p className="text-muted-foreground">
                      {lead.track === "camp" ? "Free medical camp" : lead.track === "surgery" ? "Free surgery" : lead.track === "consultation" ? "Free consultation" : "Request not chosen"}
                      {" · "}
                      {lead.audience === "indian" ? lead.state : `Embassy of ${lead.embassy}`}
                    </p>
                    {lead.comment ? <p>{lead.comment}</p> : null}
                  </div>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={lead.status}
                    aria-label={`Status for ${lead.name}`}
                    onChange={(event) => setStatus(lead.id, event.target.value as LeadStatus)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
