import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { AppointmentRequestForm } from "@/features/appointments/appointment-request-form"
import { doctorById, hospitalById, specialtyById, treatmentById } from "@/data"
import { doctorProfileHref, hospitalProfileHref } from "@/constants/routes"
import type { ProviderRefType } from "@/types"

export const metadata: Metadata = {
  title: "Request an Appointment",
  description: "Send an appointment request to a selected hospital or doctor.",
}

interface AppointmentRequestPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AppointmentRequestPage({ searchParams }: AppointmentRequestPageProps) {
  const params = await searchParams
  const providerType = typeof params.providerType === "string" ? params.providerType : undefined
  const providerId = typeof params.providerId === "string" ? params.providerId : undefined
  if (!providerId || (providerType !== "doctor" && providerType !== "hospital")) notFound()

  let provider: { type: ProviderRefType; id: string; name: string; specialty: string; location: string }
  let treatments: { id: string; name: string }[]
  let backHref: string

  if (providerType === "doctor") {
    const doctor = doctorById[providerId]
    if (!doctor) notFound()
    provider = { type: "doctor", id: doctor.id, name: doctor.name, specialty: specialtyById[doctor.specialization]?.name ?? "Doctor", location: `${doctor.city}, ${doctor.state}` }
    treatments = doctor.treatments.map((id) => treatmentById[id]).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({ id: item.id, name: item.name }))
    backHref = doctorProfileHref(doctor.slug)
  } else {
    const hospital = hospitalById[providerId]
    if (!hospital) notFound()
    provider = { type: "hospital", id: hospital.id, name: hospital.name, specialty: hospital.specialties.map((id) => specialtyById[id]?.name).filter(Boolean).join(", ") || hospital.facilityType, location: `${hospital.city}, ${hospital.state}` }
    treatments = hospital.treatments.map((id) => treatmentById[id]).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({ id: item.id, name: item.name }))
    backHref = hospitalProfileHref(hospital.slug)
  }

  return <div className="mx-auto max-w-3xl space-y-6 py-8">
    <Breadcrumbs items={[{label:"Home",href:"/"},{label:provider.type === "doctor" ? "Doctors" : "Hospitals",href:provider.type === "doctor" ? "/doctors" : "/hospitals"},{label:provider.name},{label:"Appointment request"}]} />
    <AppointmentRequestForm provider={provider} treatments={treatments} backHref={backHref} />
  </div>
}
