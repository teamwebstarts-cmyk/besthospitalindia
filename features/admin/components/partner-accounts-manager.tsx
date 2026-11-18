"use client"

/**
 * PartnerAccountsManager — /admin/partners (pages/24 + 14-admin-module-contracts).
 *
 * Contract (14-admin-module-contracts.md): "Which organizations have partner
 * access? — Partner account table — Approve, suspend, manage staff".
 *
 * Data: the frozen `PartnerUser` fixtures (data/portal.ts) grouped by their
 * linked organization (Hospital). The demo contract has exactly three partner
 * users across two organizations + the doctor-side coordinator desk — the UI
 * presents exactly that and invents no extra organizations. Organization
 * verification state comes from the linked Hospital fixture; an empty state
 * is shown when a partner has no linked organization.
 *
 * Interactions: approve/suspend access (local mock, ConfirmDialog-guarded),
 * and a staff view per organization (all fixture partner users of that
 * hospital). No notifications exist in this phase.
 *
 * Layout: organization cards + staff tables (desktop) / stacked (mobile).
 */

import { useMemo, useReducer, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { formatDate, formatDateTime } from "@/features/admin/format"
import { partnerHospital } from "@/features/admin/selectors"
import { cn } from "@/lib/utils"
import type { PartnerUser } from "@/types"

// ---------------------------------------------------------------------------
// Local mock state — never mutates the frozen fixtures
// ---------------------------------------------------------------------------

export interface PartnerChange {
  action: "access_approved" | "access_suspended"
  at: string
}

export interface PartnerRecord {
  user: PartnerUser
  change: PartnerChange | null
}

export interface PartnerManagerState {
  records: PartnerRecord[]
  notice: string | null
}

export type PartnerManagerAction =
  | { type: "approve"; id: string }
  | { type: "suspend"; id: string }
  | { type: "dismiss-notice" }

function nowIso(): string {
  return new Date().toISOString()
}

export function partnerManagerReducer(
  state: PartnerManagerState,
  action: PartnerManagerAction,
): PartnerManagerState {
  switch (action.type) {
    case "approve":
      return {
        ...state,
        notice: `Demo: partner access approved locally for ${state.records.find((r) => r.user.id === action.id)?.user.name ?? action.id}. Nothing was stored or communicated.`,
        records: state.records.map((record) =>
          record.user.id === action.id
            ? { ...record, change: { action: "access_approved", at: nowIso() } }
            : record,
        ),
      }
    case "suspend":
      return {
        ...state,
        notice: `Demo: partner access suspended locally for ${state.records.find((r) => r.user.id === action.id)?.user.name ?? action.id}. The demo sign-in hint is unaffected — no real auth exists in this phase.`,
        records: state.records.map((record) =>
          record.user.id === action.id
            ? { ...record, change: { action: "access_suspended", at: nowIso() } }
            : record,
        ),
      }
    case "dismiss-notice":
      return { ...state, notice: null }
    default:
      return state
  }
}

export function makeInitialPartnerState(users: readonly PartnerUser[]): PartnerManagerState {
  return {
    records: users.map((user) => ({ user, change: null })),
    notice: null,
  }
}

const ROLE_LABELS: Record<PartnerUser["role"], string> = {
  owner: "Owner",
  staff: "Staff",
  coordinator: "Coordinator",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface PartnerAccountsManagerProps {
  partnerUsers: readonly PartnerUser[]
  className?: string
}

export function PartnerAccountsManager({ partnerUsers, className }: PartnerAccountsManagerProps) {
  const [state, dispatch] = useReducer(partnerManagerReducer, partnerUsers, makeInitialPartnerState)
  const [query, setQuery] = useState("")
  const [staffUserId, setStaffUserId] = useState<string | null>(null)

  /**
   * Group partner users by organization. Records with a hospitalId form one
   * organization group each; the coordinator (hospitalId null) is presented
   * as the doctor-side desk group.
   */
  const organizations = useMemo(() => {
    const groups = new Map<
      string,
      { key: string; title: string; subtitle: string; records: PartnerRecord[] }
    >()
    for (const record of state.records) {
      const hospital = partnerHospital(record.user)
      const key = record.user.hospitalId ?? "doctor-desk"
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title: hospital ? hospital.name : "Doctor-side coordination desk",
          subtitle: hospital
            ? `${hospital.city}, ${hospital.state}`
            : "Coordinator accounts without a linked hospital",
          records: [],
        })
      }
      groups.get(key)!.records.push(record)
    }
    return [...groups.values()]
  }, [state.records])

  const visibleOrganizations = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return organizations
    return organizations
      .map((group) => ({
        ...group,
        records: group.records.filter((record) => {
          const haystack = [
            record.user.name,
            record.user.email,
            ROLE_LABELS[record.user.role],
            group.title,
          ]
            .join(" ")
            .toLowerCase()
          return tokens.every((token) => haystack.includes(token))
        }),
      }))
      .filter((group) => group.records.length > 0)
  }, [organizations, query])

  const staffUser = staffUserId
    ? (state.records.find((record) => record.user.id === staffUserId)?.user ?? null)
    : null

  const totalAccounts = state.records.length
  const approvedCount = state.records.filter((r) => r.change?.action === "access_approved").length
  const suspendedCount = state.records.filter((r) => r.change?.action === "access_suspended").length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary + toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 space-y-1.5 sm:max-w-sm">
          <Label htmlFor="partner-search">Search</Label>
          <Input
            id="partner-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, email, role or organization…"
            type="search"
          />
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {totalAccounts} accounts · {approvedCount} approved · {suspendedCount} suspended
        </p>
      </div>

      {state.notice ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-info/40 bg-info/10 px-4 py-3 text-sm text-info"
        >
          <span>{state.notice}</span>
          <Button variant="ghost" size="xs" onClick={() => dispatch({ type: "dismiss-notice" })}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {visibleOrganizations.length === 0 ? (
        <EmptyState
          title="No partner accounts match this search"
          description="Try another search."
          action={{
            label: "Clear search",
            onClick: () => setQuery(""),
          }}
        />
      ) : (
        <ul className="space-y-6" aria-label="Partner organizations">
          {visibleOrganizations.map((group) => {
            const hospital = group.records.find((r) => r.user.hospitalId !== null)?.user.hospitalId
            const linkedHospital = hospital ? partnerHospital(group.records[0].user) : undefined
            return (
              <li key={group.key}>
                <Card>
                  <CardHeader className="border-b [.border-b]:pb-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle>{group.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {group.subtitle} · {group.records.length} partner account
                          {group.records.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      {linkedHospital ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Organization:</span>
                          <VerificationBadge status={linkedHospital.verificationStatus} />
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No linked organization
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="gap-0 px-0 py-0">
                    {/* Desktop table in a deliberate scroll container */}
                    <div className="hidden w-full overflow-x-auto md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead scope="col">Account</TableHead>
                            <TableHead scope="col">Role</TableHead>
                            <TableHead scope="col">Joined</TableHead>
                            <TableHead scope="col">Access (demo)</TableHead>
                            <TableHead scope="col" className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.records.map((record) => (
                            <TableRow key={record.user.id}>
                              <TableCell>
                                <div className="min-w-0 space-y-0.5">
                                  <p className="truncate font-medium text-foreground">
                                    {record.user.name}
                                  </p>
                                  <p className="truncate font-mono text-xs text-muted-foreground">
                                    {record.user.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{ROLE_LABELS[record.user.role]}</TableCell>
                              <TableCell>{formatDate(record.user.createdAt)}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {record.change ? (
                                    <StatusBadge
                                      status={
                                        record.change.action === "access_approved"
                                          ? "active"
                                          : "suspended"
                                      }
                                      label={
                                        record.change.action === "access_approved"
                                          ? "Approved (demo)"
                                          : "Suspended (demo)"
                                      }
                                    />
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Fixture default
                                    </Badge>
                                  )}
                                  {record.change ? (
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateTime(record.change.at)}
                                    </p>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5">
                                  {record.change?.action === "access_suspended" ? (
                                    <Button
                                      size="xs"
                                      onClick={() => dispatch({ type: "approve", id: record.user.id })}
                                    >
                                      Approve access
                                    </Button>
                                  ) : record.change?.action === "access_approved" ? (
                                    <ConfirmDialog
                                      triggerLabel="Suspend access"
                                      triggerVariant="destructive"
                                      triggerSize="xs"
                                      title="Suspend access"
                                      description={`Suspend ${record.user.name}? Local demo only.`}
                                      confirmLabel="Suspend"
                                      destructive
                                      onConfirm={() =>
                                        dispatch({ type: "suspend", id: record.user.id })
                                      }
                                    />
                                  ) : (
                                    <>
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => setStaffUserId(record.user.id)}
                                      >
                                        Manage staff
                                      </Button>
                                      <ConfirmDialog
                                        triggerLabel="Suspend"
                                        triggerVariant="destructive"
                                        triggerSize="xs"
                                        title="Suspend access"
                                        description={`Suspend ${record.user.name}? Local demo only.`}
                                        confirmLabel="Suspend"
                                        destructive
                                        onConfirm={() =>
                                          dispatch({ type: "suspend", id: record.user.id })
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <ul className="space-y-3 p-4 md:hidden" aria-label={`${group.title} accounts`}>
                      {group.records.map((record) => (
                        <li key={record.user.id} className="rounded-lg border p-3">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-foreground">{record.user.name}</p>
                              <Badge variant="outline">{ROLE_LABELS[record.user.role]}</Badge>
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">
                              {record.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {formatDate(record.user.createdAt)} ·{" "}
                              {record.change
                                ? record.change.action === "access_approved"
                                  ? "approved locally"
                                  : "suspended locally"
                                : "fixture default"}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setStaffUserId(record.user.id)}
                            >
                              Manage staff
                            </Button>
                            {record.change?.action === "access_suspended" ? (
                              <Button
                                size="sm"
                                onClick={() => dispatch({ type: "approve", id: record.user.id })}
                              >
                                Approve access
                              </Button>
                            ) : (
                              <ConfirmDialog
                                triggerLabel="Suspend"
                                triggerVariant="destructive"
                                triggerSize="sm"
                                title="Suspend access"
                                description={`Suspend ${record.user.name}? Local demo only.`}
                                confirmLabel="Suspend"
                                destructive
                                onConfirm={() => dispatch({ type: "suspend", id: record.user.id })}
                              />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      {/* Manage-staff sheet */}
      {staffUser ? (
        <Sheet open onOpenChange={(open) => { if (!open) setStaffUserId(null) }}>
          <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">Partner staff — {ROLE_LABELS[staffUser.role]}</SheetTitle>
              <SheetDescription className="text-left">
                {staffUser.name} · {staffUser.email}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 p-4">
              <section aria-label="Staff account details" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Account details</h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Partner user id</dt>
                    <dd className="font-mono text-xs">{staffUser.id}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd>{ROLE_LABELS[staffUser.role]}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Linked organization</dt>
                    <dd className="max-w-48 truncate text-right">
                      {staffUser.hospitalId ?? "None (coordinator)"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Joined</dt>
                    <dd>{formatDate(staffUser.createdAt)}</dd>
                  </div>
                </dl>
                <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs text-warning">
                  {staffUser.mockLoginHint}
                </p>
              </section>
              <Separator />
              <section aria-label="Staff management scope" className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Staff roster</h3>
                <p className="text-sm text-muted-foreground">
                  Invite/remove staff is outside the demo fixtures — use suspend/approve on the table.
                </p>
              </section>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  )
}
