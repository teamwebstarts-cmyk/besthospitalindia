import type { Metadata } from "next"
import {
  CalendarDaysIcon,
  FileTextIcon,
  MessagesSquareIcon,
  StarIcon,
} from "lucide-react"

import { DashboardKpi } from "@/features/hospital-portal/dashboard-kpi"
import { QueueList, type QueueItem } from "@/features/hospital-portal/queue-list"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import {
  demoAppointments,
  demoEnquiries,
  getDemoHospital,
  openEnquiries,
  pendingAppointments,
  profileCompletion,
  reviewsAwaitingReply,
} from "@/features/hospital-portal/demo-context"
import { ROUTES } from "@/constants/routes"
import { doctorById, specialtyById } from "@/data"

/**
 * /hospital-portal — partner dashboard (pages/46).
 *
 * Server Component: scoped fixture selectors produce every number, so KPI
 * totals reconcile exactly with the queues below them and with the module
 * pages they link to (spec: "KPI totals reconcile; actions lead to routes").
 */

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Hospital partner demo dashboard: enquiries, appointments, profile completion, and reviews needing attention (fictional demo data).",
}

export default function HospitalPortalDashboardPage() {
  const hospital = getDemoHospital()

  const enquiries = demoEnquiries()
  const openEnquiryList = openEnquiries()
  const appointmentQueue = demoAppointments()
  const pendingAppointmentList = pendingAppointments()
  const replyQueue = reviewsAwaitingReply()
  const completion = profileCompletion(hospital)

  const enquiryItems: QueueItem[] = openEnquiryList.map((enquiry) => ({
    id: enquiry.id,
    title: `${enquiry.patientName} — ${specialtyById[enquiry.specialty]?.name ?? enquiry.specialty}`,
    meta: formatDate(enquiry.consentAt),
    status: enquiry.status,
    href: `${ROUTES.hospitalPortal.enquiries}?enquiry=${encodeURIComponent(enquiry.id)}`,
  }))

  const appointmentItems: QueueItem[] = pendingAppointmentList.map((appointment) => {
    const doctor =
      appointment.providerType === "doctor" ? doctorById[appointment.providerId] : undefined
    const target = doctor ? doctor.name : hospital.name
    return {
      id: appointment.id,
      title: `${appointment.patientId.replace("pat-demo-", "Patient ")} — ${target}`,
      meta: formatDate(appointment.preferredDate),
      status: appointment.status,
      href: `${ROUTES.hospitalPortal.appointments}?request=${encodeURIComponent(appointment.id)}`,
    }
  })

  const replyItems: QueueItem[] = replyQueue.map((review) => ({
    id: review.id,
    title: review.title,
    meta: `${review.rating}/5 · ${formatDate(review.createdAt)}`,
    status: review.status,
    href: `${ROUTES.hospitalPortal.reviews}?review=${encodeURIComponent(review.id)}`,
  }))

  const noEnquiries = enquiries.length === 0
  const noAppointments = appointmentQueue.length === 0

  return (
    <div className="space-y-6">
      <PortalPageHeader label="Dashboard" showDemoNotice={false} />

      <section aria-label="Key numbers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpi
          label="Enquiries"
          value={String(openEnquiryList.length)}
          icon={MessagesSquareIcon}
          href={ROUTES.hospitalPortal.enquiries}
          hideViewLink
        />
        <DashboardKpi
          label="Appointments"
          value={String(pendingAppointmentList.length)}
          icon={CalendarDaysIcon}
          href={ROUTES.hospitalPortal.appointments}
          hideViewLink
        />
        <DashboardKpi
          label="Profile"
          value={`${completion.percent}%`}
          icon={FileTextIcon}
          href={ROUTES.hospitalPortal.profile}
          hideViewLink
        />
        <DashboardKpi
          label="Reviews"
          value={String(replyQueue.length)}
          icon={StarIcon}
          href={ROUTES.hospitalPortal.reviews}
          hideViewLink
        />
      </section>

      <section aria-label="Action queues" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QueueList
          title="Enquiries"
          items={enquiryItems}
          emptyTitle={noEnquiries ? "No enquiries in demo data" : "Nothing open"}
        />
        <QueueList
          title="Appointments"
          items={appointmentItems}
          emptyTitle={noAppointments ? "No requests in demo data" : "Nothing pending"}
        />
        <QueueList
          title="Reviews"
          items={replyItems}
          emptyTitle="Nothing to reply to"
        />
      </section>
    </div>
  )
}

function formatDate(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleDateString("en-IN", { dateStyle: "medium" })
}