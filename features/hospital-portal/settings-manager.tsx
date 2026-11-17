"use client"

/**
 * SettingsManager — account preferences & security UI (pages/56).
 *
 * Spec components: SettingsForm + ConfirmDialog (composed locally — the
 * catalog's SettingsForm is not implemented in the shared layer; logged in the
 * A09 report). Sections:
 * - Notification preferences (local checkbox state).
 * - Display preferences (demo-only select state).
 * - Security UI: mock password change with validation; NO auth backend, the
 *   form only demonstrates validation + latency-free local success.
 * - Mock sign-out via ConfirmDialog; returns to the public home page.
 *
 * All interactions operate on local mock state (spec 6 boundary). "Sign out"
 * is a navigation to "/" — no session exists to destroy.
 */

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CircleCheckBigIcon, KeyRoundIcon, LogOutIcon, SlidersHorizontalIcon } from "lucide-react"

export interface SettingsManagerProps {
  /** Display name of the demo signed-in user. */
  userName: string
  /** Email of the demo signed-in user (read-only display). */
  userEmail: string
  className?: string
}

interface NotificationPrefs {
  enquiries: boolean
  appointments: boolean
  reviews: boolean
  ratingUpdates: boolean
}

const DEMO_TODAY = "2026-11-17"

export function SettingsManager({ userName, userEmail, className }: SettingsManagerProps) {
  const router = useRouter()

  const [prefs, setPrefs] = React.useState<NotificationPrefs>({
    enquiries: true,
    appointments: true,
    reviews: true,
    ratingUpdates: false,
  })
  const [language, setLanguage] = React.useState("en")
  const [prefsFlash, setPrefsFlash] = React.useState<string | null>(null)

  // Mock password change state.
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [passwordFlash, setPasswordFlash] = React.useState<string | null>(null)

  function togglePref(key: keyof NotificationPrefs) {
    setPrefs((current) => {
      const next = { ...current, [key]: !current[key] }
      setPrefsFlash(
        `Notification preference “${PREF_LABELS[key]}” ${next[key] ? "enabled" : "disabled"} — saved to local demo state only; nothing is persisted or emailed.`,
      )
      return next
    })
  }

  function savePassword() {
    setPasswordError(null)
    setPasswordFlash(null)
    if (currentPassword.length === 0) {
      setPasswordError("Enter the current password (any demo value — no real account exists).")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }
    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from the current password.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.")
      return
    }
    setPasswordFlash(
      "Password change validated and “saved” in demo state only. There is no auth backend — no credential was stored or checked.",
    )
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  function signOut() {
    // Mock sign-out: navigate to the public home page. No session exists.
    router.push("/")
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Notification preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontalIcon aria-hidden className="size-4 text-muted-foreground" />
              Notification preferences
            </CardTitle>
            <CardDescription>
              Choose which demo queue updates the portal highlights. Toggles save to local demo
              state only.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <ul className="space-y-1">
              {(Object.keys(PREF_LABELS) as Array<keyof NotificationPrefs>).map((key) => (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/60">
                    <Checkbox
                      checked={prefs[key]}
                      onCheckedChange={() => togglePref(key)}
                      aria-label={PREF_LABELS[key]}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        {PREF_LABELS[key]}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {PREF_DESCRIPTIONS[key]}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {prefsFlash ? (
              <p role="status" aria-live="polite" className="text-xs font-medium text-success">
                {prefsFlash}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Display + account */}
        <Card>
          <CardHeader>
            <CardTitle>Display &amp; account</CardTitle>
            <CardDescription>
              Demo display preference and the (read-only) demo account identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="settings-language">Interface language (demo)</Label>
              <Select value={language} onValueChange={(next) => setLanguage(next ?? "en")}>
                <SelectTrigger id="settings-language" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी (demo placeholder)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Demo-only control; the mock phase ships English strings only.
              </p>
            </div>

            <Separator />

            <dl className="space-y-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">Signed in as</dt>
                <dd className="font-medium text-foreground">{userName}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{userEmail}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">Account type</dt>
                <dd className="font-medium text-foreground">Hospital partner (demo owner)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Security UI — mock only */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRoundIcon aria-hidden className="size-4 text-muted-foreground" />
            Security — change password (mock)
          </CardTitle>
          <CardDescription>
            Validation-only demo form. There is no real authentication backend in the mock phase:
            values are never checked against or written to any account.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value)
                  setPasswordError(null)
                }}
                autoComplete="current-password"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  setPasswordError(null)
                }}
                autoComplete="new-password"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setPasswordError(null)
                }}
                autoComplete="new-password"
              />
            </div>
          </div>

          {passwordError ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {passwordError}
            </p>
          ) : null}
          {passwordFlash ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
            >
              <CircleCheckBigIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{passwordFlash}</span>
            </div>
          ) : null}

          <div>
            <Button type="button" size="sm" variant="outline" onClick={savePassword}>
              Update password (demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mock sign-out */}
      <Card className="mt-4 border-warning/40">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Ends the demo portal session and returns to the public website. No server session
            exists — this is a navigation, not an auth action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmDialog
            triggerLabel="Sign out of demo portal"
            triggerVariant="outline"
            title="Sign out of the hospital portal?"
            description="Returns you to the public website home page. Unsaved demo changes on portal pages are local state and will be lost. No real session exists to terminate."
            confirmLabel="Sign out (demo)"
            onConfirm={signOut}
          />
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <LogOutIcon aria-hidden className="size-3.5" />
            Last demo activity recorded: {DEMO_TODAY} (fixture metadata).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const PREF_LABELS: Record<keyof NotificationPrefs, string> = {
  enquiries: "New patient enquiries",
  appointments: "Appointment requests",
  reviews: "New reviews awaiting reply",
  ratingUpdates: "Rating assessment updates",
}

const PREF_DESCRIPTIONS: Record<keyof NotificationPrefs, string> = {
  enquiries: "Flag new items in the enquiries queue (demo).",
  appointments: "Flag pending appointment requests (demo).",
  reviews: "Flag published reviews without a partner reply (demo).",
  ratingUpdates: "Flag PER/CER assessment status changes (demo).",
}
