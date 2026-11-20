"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PendingButton } from "@/features/portal/pending-button"

export interface PartnerListingRow {
  id: string
  kind: "hospital" | "doctor"
  name: string
  phone: string
  city: string
  state?: string
  imageUrl?: string
  overview?: string
  note?: string
  status: "pending" | "approved" | "rejected"
}

export function PartnerListingEdit({
  row,
  onSaved,
}: {
  row: PartnerListingRow
  onSaved: () => void
}) {
  const [name, setName] = useState(row.name)
  const [phone, setPhone] = useState(row.phone)
  const [city, setCity] = useState(row.city)
  const [state, setState] = useState(row.state ?? "")
  const [imageUrl, setImageUrl] = useState(row.imageUrl ?? "")
  const [overview, setOverview] = useState(row.overview ?? row.note ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSaved(false)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        name,
        phone,
        city,
        state,
        imageUrl,
        overview,
        note: overview,
      }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    setPending(false)
    if (!response.ok) {
      setError(payload?.error ?? "Could not save changes.")
      return
    }
    setSaved(true)
    onSaved()
  }

  const nameLabel = row.kind === "hospital" ? "Hospital / organisation name" : "Doctor name"

  return (
    <form className="mt-3 space-y-3 border-t border-border pt-3" onSubmit={onSubmit}>
      <p className="text-xs text-muted-foreground">
        {row.status === "approved"
          ? "Saving changes sends this listing back to admin for approval before it goes live again."
          : "Update details while admin reviews this listing."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`edit-name-${row.id}`}>{nameLabel}</Label>
          <Input id={`edit-name-${row.id}`} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`edit-phone-${row.id}`}>Phone</Label>
          <Input id={`edit-phone-${row.id}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`edit-city-${row.id}`}>City</Label>
          <Input id={`edit-city-${row.id}`} value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`edit-state-${row.id}`}>State</Label>
          <Input id={`edit-state-${row.id}`} value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`edit-image-${row.id}`}>Image URL</Label>
          <Input id={`edit-image-${row.id}`} type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`edit-overview-${row.id}`}>
          {row.kind === "hospital" ? "About the facility" : "About your practice"}
        </Label>
        <Textarea id={`edit-overview-${row.id}`} rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-primary">Saved. Status may show as pending until admin approves again.</p>
      ) : null}
      <PendingButton type="submit" pending={pending} pendingLabel="Saving…" size="sm">
        Save changes
      </PendingButton>
    </form>
  )
}