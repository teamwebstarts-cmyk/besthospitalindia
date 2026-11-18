"use client"

import { useState } from "react"
import Link from "next/link"
import { BuildingIcon, StethoscopeIcon, UserRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Role = "patient" | "hospital" | "doctor"

const roles: readonly {
  id: Role
  label: string
  description: string
  icon: typeof UserRoundIcon
}[] = [
  {
    id: "patient",
    label: "Patient",
    description: "Find a hospital or doctor and request an appointment directly.",
    icon: UserRoundIcon,
  },
  {
    id: "hospital",
    label: "Hospital partner",
    description: "Manage your hospital profile, specialties, doctors and appointments.",
    icon: BuildingIcon,
  },
  {
    id: "doctor",
    label: "Doctor partner",
    description: "Manage your public profile, hospital associations and appointments.",
    icon: StethoscopeIcon,
  },
]

export interface AuthEntryCardProps {
  className?: string
}

/**
 * MVP entry point. Patients do not create an account or open a separate
 * dashboard; they browse public providers and submit a direct appointment
 * request. Hospital and doctor partners enter through their interest forms.
 */
export function AuthEntryCard({ className }: AuthEntryCardProps) {
  const [role, setRole] = useState<Role>("patient")
  const activeRole = roles.find((entry) => entry.id === role) ?? roles[0]

  return (
    <div className={cn("mx-auto w-full max-w-lg space-y-5", className)}>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Continue to BestHospitalIndia
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to use the platform.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Account role"
        className="grid gap-2 sm:grid-cols-3"
      >
        {roles.map((entry) => {
          const selected = role === entry.id
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setRole(entry.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary/60 bg-primary/5 text-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <entry.icon
                aria-hidden
                className={cn(
                  "size-5",
                  selected ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-semibold">{entry.label}</span>
              <span className="text-xs leading-snug">{entry.description}</span>
            </button>
          )
        })}
      </div>

      <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
        <div className="space-y-1 text-center">
          <activeRole.icon aria-hidden className="mx-auto size-8 text-primary" />
          {role === "patient" ? (
            <>
              <h2 className="text-lg font-semibold text-foreground">
                Request an appointment without creating an account
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Patients do not have a separate dashboard in this MVP. Choose a
                hospital or doctor, enter your contact details and appointment
                preference, and submit a request directly to that provider.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground">
                {activeRole.label} registration
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {role === "hospital"
                  ? "Register your hospital so your team can manage its public profile, specialties, associated doctors and appointment requests."
                  : "Register your doctor profile so you can manage your public information, hospital associations, availability and appointment requests."}
              </p>
            </>
          )}
        </div>

        {role === "patient" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" render={<Link href="/doctors" />}>
              Browse doctors
            </Button>
            <Button variant="outline" className="flex-1" render={<Link href="/hospitals" />}>
              Browse hospitals
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            render={
              <Link
                href={
                  role === "hospital"
                    ? "/for-hospitals#interest-form"
                    : "/for-doctors#interest-form"
                }
              />
            }
          >
            {role === "hospital"
              ? "Go to hospital interest form"
              : "Go to doctor interest form"}
          </Button>
        )}
      </section>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
