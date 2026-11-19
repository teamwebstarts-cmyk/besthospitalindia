/**
 * /doctors/[slug] — doctor profile (Agent A05).
 *
 * Spec source: implementation/pages/08-doctor-profile.md:
 * identity/verification; specialization; qualifications; experience;
 * registration; hospitals; treatments; languages; PER + MER (independent);
 * verified reviews; consultation CTA.
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { doctors, reviewsForProvider, specialtyById } from "@/data"
import { isCataloguePublic } from "@/lib/catalogue/store"
import { getDoctorBySlug, getHospitalById, getTreatmentById } from "@/lib/search"
import { DoctorProfilePageView } from "@/features/providers/components/doctor-profile-page"

interface DoctorProfilePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return doctors.map((doctor) => ({ slug: doctor.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: DoctorProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor || !isCataloguePublic("doctor", doctor.id)) {
    return { title: "Doctor not found" }
  }

  const specialization = specialtyById[doctor.specialization]?.name
  const titleParts = [doctor.name]
  if (specialization) titleParts.push(specialization)
  titleParts.push(doctor.city)

  return {
    title: titleParts.join(" — "),
    description: `Profile for ${doctor.name}${specialization ? `, ${specialization}` : ""}, in ${doctor.city}, India. Independent PER and MER ratings — informational only, not clinical advice.`,
  }
}

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const { slug } = await params
  const doctor = getDoctorBySlug(slug)
  if (!doctor || !isCataloguePublic("doctor", doctor.id)) {
    notFound()
  }

  const specializationName = specialtyById[doctor.specialization]?.name
  const hospitals = doctor.hospitalIds
    .map((hospitalId) => getHospitalById(hospitalId))
    .filter((hospital): hospital is NonNullable<typeof hospital> => hospital !== undefined && isCataloguePublic("hospital", hospital.id))
  const treatments = doctor.treatments
    .map((treatmentId) => getTreatmentById(treatmentId))
    .filter((treatment): treatment is NonNullable<typeof treatment> => treatment !== undefined)
  const doctorReviews = reviewsForProvider("doctor", doctor.id).filter(
    (review) => review.status === "published",
  )

  return (
    <DoctorProfilePageView
      doctor={doctor}
      specializationName={specializationName}
      hospitals={hospitals}
      treatments={treatments}
      doctorReviews={doctorReviews}
    />
  )
}