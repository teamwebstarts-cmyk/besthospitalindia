"use client"

import { AdminAppointmentManager } from "@/features/admin/cases/admin-appointment-manager"
import { AppointmentQueueManager } from "@/features/hospital-portal/appointment-queue-manager"
import { AppointmentsClient } from "@/features/doctor-portal/components/appointments-client"
import { useDemoAppointmentRequests } from "./use-demo-appointment-requests"
import type { AppointmentRequest } from "@/types"

function requestKey(requests: readonly AppointmentRequest[]): string {
  return requests.map((item) => [item.id, item.status, item.preferredDate, item.updatedAt].join(":")).join("|")
}

export function DoctorAppointmentsFeed({ doctorId, initialRequests }: { doctorId: string; initialRequests: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialRequests, (item) => item.providerType === "doctor" && item.providerId === doctorId)
  return <AppointmentsClient key={requestKey(requests)} requests={requests} />
}

export function HospitalAppointmentsFeed({ hospitalId, hospitalName, initialRequests, initialRequestKey }: { hospitalId: string; hospitalName: string; initialRequests: readonly AppointmentRequest[]; initialRequestKey?: string }) {
  const requests = useDemoAppointmentRequests(initialRequests, (item) => item.providerType === "hospital" && item.providerId === hospitalId)
  return <AppointmentQueueManager key={requestKey(requests)} requests={requests} hospitalName={hospitalName} initialRequestKey={initialRequestKey} />
}

export function AdminAppointmentsFeed({ initialRequests }: { initialRequests: readonly AppointmentRequest[] }) {
  const requests = useDemoAppointmentRequests(initialRequests)
  return <AdminAppointmentManager key={requestKey(requests)} requests={requests} />
}
