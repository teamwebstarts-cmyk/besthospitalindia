"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { CatalogueStatus } from "@/lib/catalogue/store"

const STATUSES: CatalogueStatus[] = ["pending", "approved", "rejected"]

export interface SubmissionRow {
  id: string
  name: string
  email: string
  city: string
  status: CatalogueStatus
}

export function AdminSubmissions({
  kind,
  initialRows,
  emailCodes = {},
}: {
  kind: "hospital" | "doctor"
  initialRows: SubmissionRow[]
  emailCodes?: Record<string, string>
}) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("admin@besthospitalindian.com")
  const [city, setCity] = useState("")

  async function createListing(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, name, email, phone: "", city, note: "Added by admin." }),
    })
    const payload = (await response.json().catch(() => null)) as {
      error?: string
      submission?: SubmissionRow
    } | null
    if (!response.ok || !payload?.submission) {
      setError(payload?.error ?? "Could not add the listing.")
      return
    }
    const approved = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: payload.submission.id, status: "approved" }),
    })
    if (!approved.ok) {
      setError("The listing was saved, but it is not public yet.")
      setRows((current) => [payload.submission as SubmissionRow, ...current])
      return
    }
    setRows((current) => [{ ...payload.submission, status: "approved" } as SubmissionRow, ...current])
    setName("")
    setCity("")
  }

  async function saveRow(row: SubmissionRow) {
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: row.id, name: row.name, city: row.city, status: row.status }),
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) setError(payload?.error ?? "Could not update the listing.")
  }

  async function removeRow(id: string) {
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) {
      setError("Could not remove the listing.")
      return
    }
    setRows((current) => current.filter((row) => row.id !== id))
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Listings</h2>
      <p className="text-sm text-muted-foreground">
        Add or edit a {kind} here. An approved listing appears on the public site. This is not a patient query and is not sent to a city vendor.
      </p>
      <form onSubmit={createListing} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Official email</span>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">City</span>
          <Input value={city} onChange={(event) => setCity(event.target.value)} required minLength={2} />
        </label>
        <Button type="submit">Add listing</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <Card>
              <CardContent className="grid gap-2 p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center">
                <Input
                  aria-label={`Name for ${row.id}`}
                  value={row.name}
                  onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))}
                />
                <Input
                  aria-label={`City for ${row.id}`}
                  value={row.city}
                  onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, city: event.target.value } : item))}
                />
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={row.status}
                  aria-label={`Status for ${row.name}`}
                  onChange={(event) => {
                    const status = event.target.value as CatalogueStatus
                    const next = { ...row, status }
                    setRows((current) => current.map((item) => item.id === row.id ? next : item))
                    void saveRow(next)
                  }}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => saveRow(row)}>Save</Button>
                  <Button type="button" variant="outline" onClick={() => removeRow(row.id)}>Remove</Button>
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-4">
                  {row.email} · {row.id}
                  {emailCodes[row.id] ? ` · code ${emailCodes[row.id]} · from info@wispr.hospital` : ""}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
