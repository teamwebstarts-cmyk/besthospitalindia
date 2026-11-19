"use client"

import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { CatalogueKind, CatalogueStatus } from "@/lib/catalogue/store"

const STATUSES: CatalogueStatus[] = ["approved", "pending", "rejected"]

export interface CatalogueRow {
  id: string
  name: string
  place: string
  status: CatalogueStatus
}

export function AdminCatalogue({ kind, initialRows }: { kind: CatalogueKind; initialRows: CatalogueRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(id: string, status: CatalogueStatus) {
    setError(null)
    const response = await fetch("/api/catalogue", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, id, status }),
    })
    if (!response.ok) {
      setError("Could not update publication.")
      return
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Approved profiles stay on the public site. Pending and rejected profiles stay off it. This does not send patient queries to the hospital or doctor.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <Card>
              <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">{row.name}</p>
                  <p className="text-muted-foreground">{row.place}</p>
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={row.status}
                  aria-label={`Publication for ${row.name}`}
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
    </div>
  )
}
