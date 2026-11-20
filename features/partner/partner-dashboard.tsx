"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDownIcon, ChevronUpIcon, LogOutIcon, PlusIcon } from "lucide-react"

import { PartnerInterestForm } from "@/features/content/partner-forms"
import { PartnerListingEdit, type PartnerListingRow } from "@/features/partner/partner-listing-edit"
import { Button } from "@/components/ui/button"
import { AsyncWaitBanner } from "@/features/portal/async-wait-banner"
import { PendingButton } from "@/features/portal/pending-button"
import { useAsyncAction } from "@/features/portal/use-async-action"
import { fetchResilient } from "@/lib/http/fetch-resilient"
import { cn } from "@/lib/utils"

const STATUS_COPY = {
  pending: "Waiting for admin approval.",
  approved: "Live on the public site.",
  rejected: "Not approved — you can edit or add a new listing.",
} as const

const STATUS_CLASS = {
  pending: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
} as const

export function PartnerDashboard({ onSignedOut }: { onSignedOut?: () => void }) {
  const [rows, setRows] = useState<PartnerListingRow[] | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [kind, setKind] = useState<"hospital" | "doctor" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { pending, slow, run } = useAsyncAction()

  const load = useCallback(async () => {
    setError(null)
    try {
      const response = await run(async () => fetchResilient("/api/partner/session"))
      const payload = (await response.json().catch(() => null)) as {
        session?: { email: string; kind: "hospital" | "doctor" } | null
        submissions?: PartnerListingRow[]
        error?: string
      } | null
      if (!response.ok) {
        setError(payload?.error ?? "Could not load your dashboard.")
        setRows(null)
        return
      }
      if (!payload?.session) {
        setRows(null)
        setEmail(null)
        setKind(null)
        return
      }
      setEmail(payload.session.email)
      setKind(payload.session.kind)
      setRows(payload.submissions ?? [])
    } catch {
      setError("Server is waking up—please wait and try again.")
    }
  }, [run])

  useEffect(() => {
    void load()
  }, [load])

  async function signOut() {
    await fetch("/api/partner/session", { method: "DELETE" })
    setRows(null)
    setEmail(null)
    setKind(null)
    onSignedOut?.()
  }

  if (!email || !kind) return null

  const addLabel = kind === "hospital" ? "Add another hospital" : "Add another doctor profile"

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {kind === "hospital" ? "Hospital listings" : "Doctor listings"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{email}</span>. Check status, edit listings, or add
              more under the same official email.
            </p>
          </div>
          <PendingButton type="button" variant="outline" size="sm" pending={pending} onClick={() => void signOut()}>
            <LogOutIcon className="size-3.5" aria-hidden />
            Sign out
          </PendingButton>
        </div>
        <AsyncWaitBanner visible={pending && rows === null} slow={slow} />
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

        <ul className="mt-4 space-y-3">
          {rows && rows.length === 0 ? (
            <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No listings yet for this email. Use the button below to submit your first one.
            </li>
          ) : null}
          {rows?.map((row) => {
            const open = expandedId === row.id
            return (
              <li key={row.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.city}
                      {row.state ? ` · ${row.state}` : ""} · Ref {row.id}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      STATUS_CLASS[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{STATUS_COPY[row.status]}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 gap-1 px-2 text-xs"
                  onClick={() => setExpandedId(open ? null : row.id)}
                >
                  {open ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
                  {open ? "Close edit" : "Edit listing"}
                </Button>
                {open ? (
                  <PartnerListingEdit
                    row={row}
                    onSaved={() => {
                      void load()
                    }}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{addLabel}</h3>
            <p className="text-xs text-muted-foreground">
              Same form as first registration. Email is fixed to your signed-in official address — no extra OTP needed
              while you are signed in.
            </p>
          </div>
          <Button
            type="button"
            variant={showAddForm ? "secondary" : "default"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <PlusIcon className="size-3.5" aria-hidden />
            {showAddForm ? "Hide form" : addLabel}
          </Button>
        </div>
        {showAddForm ? (
          <div className="mt-4">
            <PartnerInterestForm
              kind={kind}
              compact
              sessionEmail={email}
              skipRegisterOtp
              onSubmitted={() => {
                void load()
                setShowAddForm(false)
              }}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}