"use client"

/**
 * TeamManager — hospital team & RBAC demo list (pages/55).
 *
 * Spec components: DataTable + RoleSelector + ConfirmDialog. RoleSelector is
 * catalog-listed but not yet in the shared implementation (same situation as
 * DashboardKpi/QueueList), so a local composed selector is used here and the
 * gap is logged in the A09 report. Only permitted partner roles are offered:
 * owner and staff (the `coordinator` role is doctor-side per types/portal.ts).
 *
 * All interactions — invite placeholder, role change, revoke/restore — mutate
 * local component state only. No invite email, no notification, no persisted
 * account change (spec 6 boundary).
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table"
import type { PartnerRole, PartnerUser } from "@/types"
import {
  CircleCheckBigIcon,
  MailQuestionIcon,
  RotateCcwIcon,
  UserRoundCogIcon,
} from "lucide-react"

/** Permitted roles for hospital-side partner users. */
const PERMITTED_ROLES: PartnerRole[] = ["owner", "staff"]

const ROLE_LABELS: Record<PartnerRole, string> = {
  owner: "Owner",
  staff: "Staff",
  coordinator: "Coordinator (doctor-side)",
}

type MemberState = "active" | "revoked"

interface TeamRow {
  user: PartnerUser
  state: MemberState
  /** Demo provenance: fixture row vs. locally invited in this session. */
  source: "fixture" | "invited in this demo session"
}

export interface TeamManagerProps {
  members: PartnerUser[]
  /** The demo signed-in user (shown with a "you" marker). */
  currentUserId: string
  className?: string
}

export function TeamManager({ members, currentUserId, className }: TeamManagerProps) {
  const [rows, setRows] = React.useState<TeamRow[]>(() =>
    members.map((user) => ({ user, state: "active", source: "fixture" })),
  )
  const [flash, setFlash] = React.useState<string | null>(null)

  // Invite placeholder state.
  const [inviteName, setInviteName] = React.useState("")
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviteRole, setInviteRole] = React.useState<PartnerRole | "">("")
  const [inviteError, setInviteError] = React.useState<string | null>(null)

  function setRole(userId: string, role: PartnerRole) {
    setRows((current) =>
      current.map((row) =>
        row.user.id === userId
          ? { ...row, user: { ...row.user, role } }
          : row,
      ),
    )
    setFlash(`Role for ${rowName(userId)} changed to “${ROLE_LABELS[role]}” — local demo state only, no account was modified.`)
  }

  function revoke(userId: string) {
    setRows((current) =>
      current.map((row) => (row.user.id === userId ? { ...row, state: "revoked" } : row)),
    )
    setFlash(`Demo access revoked for ${rowName(userId)} — local demo state only. No session or account exists to disable.`)
  }

  function restore(userId: string) {
    setRows((current) =>
      current.map((row) => (row.user.id === userId ? { ...row, state: "active" } : row)),
    )
    setFlash(`Demo access restored for ${rowName(userId)} — local demo state only.`)
  }

  function rowName(userId: string): string {
    return rows.find((row) => row.user.id === userId)?.user.name ?? "member"
  }

  function inviteMember() {
    setInviteError(null)
    setFlash(null)
    const name = inviteName.trim()
    const email = inviteEmail.trim()
    if (name.length < 2) {
      setInviteError("Enter the team member's name (at least 2 characters).")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Enter a valid email address for the demo record.")
      return
    }
    if (!inviteRole) {
      setInviteError("Choose a role (only owner and staff are permitted hospital-side roles).")
      return
    }
    if (rows.some((row) => row.user.email.toLowerCase() === email.toLowerCase())) {
      setInviteError("A member with this email already exists in the demo list.")
      return
    }

    const user: PartnerUser = {
      id: `demo-team-local-${Date.now()}`,
      name,
      email,
      role: inviteRole,
      hospitalId: members[0]?.hospitalId ?? null,
      mockLoginHint: "demo sign-in placeholder (no real account)",
      createdAt: new Date().toISOString(),
    }
    setRows((current) => [...current, { user, state: "active", source: "invited in this demo session" }])
    setFlash(
      `Demo invite recorded for ${name} (role ${ROLE_LABELS[inviteRole]}). No real invite email was sent — the row exists only on this page.`,
    )
    setInviteName("")
    setInviteEmail("")
    setInviteRole("")
  }

  const columns: Array<DataTableColumn<TeamRow>> = [
    {
      key: "user",
      header: "Member",
      render: (row) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {row.user.name}
            {row.user.id === currentUserId ? (
              <span className="rounded-sm bg-muted px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                you
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <Select
          value={row.user.role}
          onValueChange={(next) => {
            if (next && next !== row.user.role) setRole(row.user.id, next as PartnerRole)
          }}
        >
          <SelectTrigger aria-label={`Role for ${row.user.name}`} className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PERMITTED_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "state",
      header: "Access",
      render: (row) => (
        <StatusBadge
          status={row.state === "active" ? "active" : "inactive"}
          label={row.state === "active" ? "Active" : "Revoked (demo)"}
        />
      ),
    },
    {
      key: "joined",
      header: "Added",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {row.user.createdAt.slice(0, 10)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        row.state === "active" ? (
          <ConfirmDialog
            triggerLabel="Revoke"
            triggerVariant="ghost"
            triggerSize="xs"
            destructive
            title={`Revoke demo access for ${row.user.name}?`}
            description="This flips the row's demo access state on this page only. No real account, session or notification exists in the mock phase."
            confirmLabel="Revoke (demo)"
            onConfirm={() => revoke(row.user.id)}
          />
        ) : (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => restore(row.user.id)}
            className="gap-1"
          >
            <RotateCcwIcon aria-hidden className="size-3" />
            Restore
          </Button>
        ),
    },
  ]

  return (
    <div className={className}>
      {flash ? (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          <CircleCheckBigIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{flash}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundCogIcon aria-hidden className="size-4 text-muted-foreground" />
            Authorized team members (demo)
          </CardTitle>
          <CardDescription>
            Staff list for the demo hospital with role and access state. Role changes and
            revocation update this page&apos;s local state only.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-0 px-0 py-0 [&_[data-slot=table-container]]:rounded-none [&_[data-slot=table-container]]:border-0">
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.user.id}
            emptyMessage="No team members in the demo set yet — invite one below."
            emptyIcon={UserRoundCogIcon}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailQuestionIcon aria-hidden className="size-4 text-muted-foreground" />
            Invite a team member (placeholder)
          </CardTitle>
          <CardDescription>
            Adds a row to the demo list. No real invite email is sent and no account is created —
            this is the spec&apos;s invite placeholder.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="invite-name">
                Name <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(event) => {
                  setInviteName(event.target.value)
                  setInviteError(null)
                }}
                placeholder="e.g. Demo Front Desk (fictional)"
                autoComplete="off"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="invite-email">
                Email <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => {
                  setInviteEmail(event.target.value)
                  setInviteError(null)
                }}
                placeholder="name@example.com"
                autoComplete="off"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="invite-role">
                Role <span aria-hidden className="text-destructive">*</span>
              </Label>
              <Select
                value={inviteRole}
                onValueChange={(next) => {
                  setInviteRole((next ?? "") as PartnerRole | "")
                  setInviteError(null)
                }}
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="Choose a role…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PERMITTED_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {inviteError ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {inviteError}
            </p>
          ) : null}

          <div>
            <Button type="button" size="sm" onClick={inviteMember}>
              Add to demo team list
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Only permitted hospital-side roles are shown (owner, staff). The coordinator role
            belongs to the doctor side of the platform and is not offered here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
