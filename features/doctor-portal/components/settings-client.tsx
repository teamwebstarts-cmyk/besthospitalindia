"use client"

/**
 * SettingsClient — /doctor-portal/settings (pages/65).
 *
 * Demo preferences and account UI per spec. Everything is local state:
 * - preference toggles (demo notification switches, session behaviour)
 * - profile summary linking to the profile module
 * - "sign out" runs through the shared ConfirmDialog and ends nowhere — it
 *   shows an honest demo confirmation ("No real auth/security action").
 *
 * The notification preference checkboxes are presentation-only demo state; the
 * fixture layer has no doctor-preferences entity and A10 must not add one.
 */

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { StatusBadge } from "@/components/shared/status-badge"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Doctor } from "@/types"

export interface SettingsClientProps {
  doctor: Doctor
  className?: string
}

interface PreferenceState {
  appointmentEmails: boolean
  reviewAlerts: boolean
  marketingUpdates: boolean
  compactTables: boolean
}

const DEFAULT_PREFERENCES: PreferenceState = {
  appointmentEmails: true,
  reviewAlerts: true,
  marketingUpdates: false,
  compactTables: false,
}

function PreferenceRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5 shrink-0"
      />
    </div>
  )
}

export function SettingsClient({ doctor, className }: SettingsClientProps) {
  const [preferences, setPreferences] = useState<PreferenceState>(DEFAULT_PREFERENCES)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [signedOut, setSignedOut] = useState(false)

  function updatePreference<K extends keyof PreferenceState>(key: K, value: boolean) {
    setPreferences((previous) => ({ ...previous, [key]: value }))
    setSavedAt(null)
  }

  function handleSave() {
    setSavedAt(new Date().toISOString())
  }

  if (signedOut) {
    return (
      <Card className={cn("mx-auto max-w-lg", className)}>
        <CardHeader>
          <CardTitle>Demo session ended</CardTitle>
          <CardDescription>
            This is the honest demo boundary: there was never a real session, so “signing out”
            only cleared this page’s local preference state. Nothing was authenticated and
            nothing was stored anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSignedOut(false)
                setSavedAt(null)
              }}
            >
              Back to demo settings
            </Button>
            <Button render={<a href={ROUTES.public.home} />}>Go to homepage</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The portal navigation on the left remains available — the demo build has no real
            session to terminate.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {/* Preferences */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Demo notification and display preferences. There is no delivery channel in the mock
            phase — these toggles exist to demonstrate the settings UI only.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <div className="divide-y">
            <PreferenceRow
              id="pref-appointment-emails"
              label="Appointment request alerts"
              description="Would notify you when a patient request needs a response. Demo toggle only — no email exists."
              checked={preferences.appointmentEmails}
              onChange={(value) => updatePreference("appointmentEmails", value)}
            />
            <PreferenceRow
              id="pref-review-alerts"
              label="New review alerts"
              description="Would notify you when a patient publishes a review on your profile. Demo toggle only."
              checked={preferences.reviewAlerts}
              onChange={(value) => updatePreference("reviewAlerts", value)}
            />
            <PreferenceRow
              id="pref-marketing-updates"
              label="Platform and methodology updates"
              description="Occasional platform news, such as rating methodology version changes. Demo toggle only."
              checked={preferences.marketingUpdates}
              onChange={(value) => updatePreference("marketingUpdates", value)}
            />
            <PreferenceRow
              id="pref-compact-tables"
              label="Compact table rows"
              description="Denser row spacing in portal tables (display preference for this demo session)."
              checked={preferences.compactTables}
              onChange={(value) => updatePreference("compactTables", value)}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave}>Save preferences (demo)</Button>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {savedAt
                ? `Saved locally at ${savedAt} — nothing was stored. Reloading resets the toggles.`
                : "Changes are unsaved local state."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account + session */}
      <div className="flex flex-col gap-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Demo account</CardTitle>
            <CardDescription>Fictional identity used across this portal.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">
                {doctor.city}, {doctor.state} · demo partner account
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Profile verification</span>
              <VerificationBadge status={doctor.verificationStatus} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Registration</span>
              <StatusBadge status={doctor.registration.status} />
            </div>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              render={<a href={ROUTES.doctorPortal.profile} />}
              className="self-start"
            >
              Edit profile details
            </Button>
          </CardContent>
        </Card>

        <Card size="sm" className="border-destructive/30">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Mock-only boundary: there is no authentication in this build, so sign-out clears
              nothing beyond this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfirmDialog
              triggerLabel="Sign out (demo)"
              triggerVariant="destructive"
              title="End the demo portal session?"
              description="There is no real session to end — confirming just clears this page's local demo state and shows the demo sign-out confirmation."
              confirmLabel="Sign out (demo)"
              onConfirm={() => setSignedOut(true)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
