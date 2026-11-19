"use client"

import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { CatalogueStatus } from "@/lib/catalogue/store"

const STATUSES: CatalogueStatus[] = ["pending", "approved", "rejected"]

export interface SubmissionRow {
  id: string
  name: string
  email: string
  city: string
  status: CatalogueStatus
}

export function AdminSubmissions({ initialRows }: { initialRows: SubmissionRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(id: string, status: CatalogueStatus) {
    setError(null)
    const response = await fetch("/api/catalogue/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    if (!response.ok) {
      setError("Could not update the submission.")
      return
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
  }

  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Signup submissions</h2>
      <p className="text-sm text-muted-foreground">
        These are applications, not patient queries. They are not sent to a city vendor, and they stay off the public site.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <Card>
              <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-muted-foreground">{row.email} · {row.city} · {row.id}</p>
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={row.status}
                  aria-label={`Status for ${row.name}`}
                  onChange={(event) => setStatus(row.id, event.target.value as CatalogueStatus)}
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
    </section>
  )
}
