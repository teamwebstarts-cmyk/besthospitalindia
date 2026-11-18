"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { CalendarDaysIcon, CircleCheckIcon, InfoIcon, LockKeyholeIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { requestAppointment } from "@/lib/mock-actions"
import { cn } from "@/lib/utils"
import { saveDemoAppointmentRequest } from "./demo-appointment-store"
import type { AppointmentRequest, ConsultationMode, ProviderRefType } from "@/types"

interface AppointmentProvider {
  type: ProviderRefType
  id: string
  name: string
  specialty: string
  location: string
}

interface TreatmentOption { id: string; name: string }
interface FormErrors {
  patientName?: string
  email?: string
  phone?: string
  preferredDate?: string
  concern?: string
  consent?: string
}

export interface AppointmentRequestFormProps {
  provider: AppointmentProvider
  treatments: TreatmentOption[]
  backHref: string
  /** Full page vs. embedded doctor/hospital profile sidebar. */
  variant?: "page" | "sidebar"
  className?: string
}

function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function AppointmentRequestForm({
  provider,
  treatments,
  backHref,
  variant = "page",
  className,
}: AppointmentRequestFormProps) {
  const isSidebar = variant === "sidebar"
  const [patientName, setPatientName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [mode, setMode] = useState<ConsultationMode>("in_person")
  const [treatmentId, setTreatmentId] = useState("")
  const [concern, setConcern] = useState("")
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [storageError, setStorageError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [reference, setReference] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || reference) return
    setPending(true)
    setErrors({})
    setStorageError(null)

    const result = await requestAppointment({
      providerType: provider.type,
      providerId: provider.id,
      patientName: patientName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredDate,
      concern: concern.trim(),
      consent,
      mode,
      treatmentId: treatmentId || undefined,
    })

    if (!result.ok) {
      setErrors(result.errors as FormErrors)
      setPending(false)
      return
    }

    const createdAt = new Date().toISOString()
    const request: AppointmentRequest = {
      id: result.reference,
      patientId: `patient-${result.reference.toLowerCase()}`,
      patientName: patientName.trim(),
      patientEmail: email.trim(),
      patientPhone: phone.trim(),
      providerType: provider.type,
      providerId: provider.id,
      treatmentId: treatmentId || undefined,
      mode,
      preferredDate,
      concern: concern.trim(),
      status: "requested",
      createdAt,
      updatedAt: null,
    }
    if (!saveDemoAppointmentRequest(request)) {
      setStorageError("This browser could not save demo data. Please enable local storage and try again.")
      setPending(false)
      return
    }
    setReference(result.reference)
    setPending(false)
  }

  if (reference) {
    return (
      <Card className={cn("gap-4 border-border/70 shadow-sm", className)}>
        <CardHeader className="gap-1.5 pb-0">
          <div className="flex items-center gap-2 text-primary">
            <CircleCheckIcon className="size-5" aria-hidden />
            <CardTitle className={cn(isSidebar && "text-base")}>Request received</CardTitle>
          </div>
          <CardDescription className={cn(isSidebar && "text-xs")}>
            Added to the demo queue for {provider.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
            <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
              Reference
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{reference}</p>
          </div>
          {isSidebar ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Saved in this browser only. The provider reviews and confirms in the demo portal.
            </p>
          ) : (
            <>
              <Alert>
                <InfoIcon />
                <AlertTitle>What happens next</AlertTitle>
                <AlertDescription>
                  This request appears in the provider&apos;s appointment queue. The provider must
                  review and confirm it.
                </AlertDescription>
              </Alert>
              <p className="text-xs text-muted-foreground">
                Demo only: saved in local storage. No real booking or notifications.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  render={
                    <Link
                      href={provider.type === "doctor" ? "/doctor-portal" : "/hospital-portal"}
                    />
                  }
                >
                  Open {provider.type === "doctor" ? "doctor" : "hospital"} dashboard
                </Button>
                <Button variant="outline" className="flex-1" render={<Link href={backHref} />}>
                  Back to provider profile
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("gap-4 border-border/70 shadow-sm", className)}>
      <CardHeader className={cn("gap-1.5", isSidebar && "pb-0")}>
        <div className="flex items-center gap-2 text-primary">
          <CalendarDaysIcon className={cn("size-5", isSidebar && "size-4")} aria-hidden />
          <CardTitle className={cn(isSidebar && "text-base")}>Request appointment</CardTitle>
        </div>
        <CardDescription className={cn(isSidebar && "text-xs leading-snug")}>
          {isSidebar
            ? "Not confirmed until the doctor accepts your request."
            : "Complete these details to send a request. The appointment is not confirmed until the provider accepts it."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSidebar ? (
          <div className="mb-5 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {provider.type === "doctor" ? "Selected doctor" : "Selected hospital"}
            </p>
            <p className="mt-1 text-lg font-semibold">{provider.name}</p>
            <p className="text-sm text-muted-foreground">
              {provider.specialty} · {provider.location}
            </p>
          </div>
        ) : null}
        <form onSubmit={handleSubmit} noValidate className={cn("space-y-4", isSidebar && "space-y-3")}>
          <div className={cn("grid gap-3", isSidebar ? "grid-cols-1" : "gap-4 sm:grid-cols-2")}>
          <Field label="Patient name" htmlFor="appointment-patient-name" error={errors.patientName}>
            <Input id="appointment-patient-name" value={patientName} onChange={(event) => setPatientName(event.target.value)} autoComplete="name" placeholder="Enter full name" disabled={pending} />
          </Field>
          <Field label="Email address" htmlFor="appointment-email" error={errors.email}>
            <Input id="appointment-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="name@example.com" disabled={pending} />
          </Field>
          <Field label="Mobile number" htmlFor="appointment-phone" error={errors.phone}>
            <Input id="appointment-phone" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" placeholder="+91 98765 43210" disabled={pending} />
          </Field>
          <Field label="Preferred appointment date" htmlFor="appointment-date" error={errors.preferredDate}>
            <Input id="appointment-date" type="date" min={todayISO()} value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} disabled={pending} />
          </Field>
          <Field label="Consultation type" htmlFor="appointment-mode">
            <select id="appointment-mode" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={mode} onChange={(event) => setMode(event.target.value as ConsultationMode)} disabled={pending}>
              <option value="in_person">In person</option><option value="video">Video consultation</option><option value="phone">Phone consultation</option>
            </select>
          </Field>
          {treatments.length > 0 ? <Field label="Treatment / reason (optional)" htmlFor="appointment-treatment">
            <select id="appointment-treatment" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={treatmentId} onChange={(event) => setTreatmentId(event.target.value)} disabled={pending}>
              <option value="">General consultation</option>{treatments.map((treatment) => <option key={treatment.id} value={treatment.id}>{treatment.name}</option>)}
            </select>
          </Field> : null}
        </div>
        <Field label="Reason for appointment" htmlFor="appointment-concern" error={errors.concern}>
          <Textarea
            id="appointment-concern"
            rows={isSidebar ? 3 : 4}
            maxLength={2000}
            value={concern}
            onChange={(event) => setConcern(event.target.value)}
            placeholder="Briefly describe what you need help with."
            disabled={pending}
          />
        </Field>
        <div className="flex items-start gap-3">
          <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} disabled={pending} id="appointment-consent" />
          <div className="space-y-1"><Label htmlFor="appointment-consent" className="font-normal">I agree to be contacted about this appointment request.</Label>{errors.consent ? <p className="text-xs text-destructive">{errors.consent}</p> : null}</div>
        </div>
        {storageError ? <p role="alert" className="text-sm text-destructive">{storageError}</p> : null}
        <Button
          type="submit"
          variant={isSidebar ? "cta" : "default"}
          className={cn("w-full", isSidebar && "rounded-full font-semibold shadow-sm")}
          disabled={pending}
        >
          {pending ? "Submitting…" : isSidebar ? "Submit request" : "Submit appointment request"}
        </Button>
        <p className="flex items-start gap-2 text-[0.6875rem] leading-snug text-muted-foreground">
          <LockKeyholeIcon className="mt-0.5 size-3 shrink-0" aria-hidden />
          Demo only — saved in this browser, not sent to a real provider.
        </p>
      </form>
    </CardContent>
  </Card>
  )
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={htmlFor}>{label}</Label>{children}{error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}</div>
}
