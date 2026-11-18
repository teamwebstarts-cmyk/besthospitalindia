"use client"

import { AdminAppointmentManager } from "@/features/admin/cases/admin-appointment-manager"
import { AppointmentQueueManager } from "@/features/hospital-portal/appointment-queue-manager"
import { AppointmentsClient } from "@/features/doctor-portal/components/appointments-client"
import { useDemoAppointmentRequests } from "./use-demo-appointment-requests"
import { useActiveDemoProvider } from "./use-active-demo-provider"
import { ProviderPreviewSelect } from "./provider-preview-select"
import type { AppointmentRequest } from "@/types"

interface ProviderOption {
  id: string
  name: string
}

function requestKey(requests: readonly AppointmentRequest[]): string {
  return requests
    .map((item) => [item.id, item.status, item.preferredDate, item.updatedAt].join(":"))
    .join("|")
}

export function DoctorAppointmentsFeed({
  fallbackDoctorId,
  providerOptions,
  initialRequests,
}: {
  fallbackDoctorId: string
  providerOptions: readonly ProviderOption[]
  initialRequests: readonly AppointmentRequest[]
}) {
  const { providerId, selectProvider } = useActiveDemoProvider(
    "doctor",
    fallbackDoctorId,
    providerOptions.map((item) => item.id),
  )
  const requests = useDemoAppointmentRequests(
    initialRequests,
    (item) => item.providerType === "doctor" && item.providerId === providerId,
  )
  return (
    <div className="space-y-4">
      <ProviderPreviewSelect providerType="doctor" value={providerId} options={providerOptions} onChange={selectProvider} />
      <AppointmentsClient key={requestKey(requests)} requests={requests} />
    </div>
  )
}

export function HospitalAppointmentsFeed({
  fallbackHospitalId,
  providerOptions,
  hospitalName,
  initialRequests,
  initialRequestKey,
}: {
  fallbackHospitalId: string
  providerOptions: readonly ProviderOption[]
  hospitalName: string
  initialRequests: readonly AppointmentRequest[]
  initialRequestKey?: string
}) {
  const { providerId, selectProvider } = useActiveDemoProvider(
    "hospital",
    fallbackHospitalId,
    providerOptions.map((item) => item.id),
  )
  const activeHospital = providerOptions.find((item) => item.id === providerId)
  const requests = useDemoAppointmentRequests(
    initialRequests,
    (item) => item.providerType === "hospital" && item.providerId === providerId,
  )
  return (
    <div className="space-y-4">
      <ProviderPreviewSelect providerType="hospital" value={providerId} options={providerOptions} onChange={selectProvider} />
      <AppointmentQueueManager
        key={requestKey(requests)}
        requests={requests}
        hospitalName={activeHospital?.name ?? hospitalName}
        initialRequestKey={initialRequestKey}
      />
    </div>
  )
}

export function AdminAppointmentsFeed({ initialRequests }: { initialRequests: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialRequests)
  return <AdminAppointmentManager key={requestKey(requests)} requests={requests} />
}
