import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VerificationBadge } from "@/features/providers/components/verification-badge"
import { HospitalProfileForm } from "@/features/hospital-portal/hospital-profile-form"
import { PortalPageHeader } from "@/features/hospital-portal/portal-page-header"
import { getDemoHospital } from "@/features/hospital-portal/demo-context"
import { ROUTES, hospitalProfileHref } from "@/constants/routes"
import { specialtyById, treatmentById } from "@/data"

/**
 * /hospital-portal/profile — profile management (pages/47).
 *
 * Server Component: resolves the demo hospital fixture, then renders the
 * client HospitalProfileForm with typed initial values. Gallery metadata is a
 * local ImageMetadataList composition (catalog component does not exist as a
 * shared file yet — logged in the A09 report). Public profile link opens the
 * A04 public page for the same fixture.
 */

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Edit the demo hospital public profile draft: overview, contact, infrastructure and gallery metadata (fictional demo data).",
}

export default function HospitalPortalProfilePage() {
  const hospital = getDemoHospital()

  const specialtyNames = hospital.specialties
    .map((id) => specialtyById[id]?.name)
    .filter((name): name is string => name !== undefined)
  const treatmentNames = hospital.treatments
    .map((id) => treatmentById[id]?.name)
    .filter((name): name is string => name !== undefined)

  const galleryImages = [
    { file: hospital.image, label: "Cover image (fixture)" },
    { file: "/images/hospitals/placeholder.svg", label: "Reception placeholder (demo)" },
    { file: "/images/hospitals/placeholder.svg", label: "Ward placeholder (demo)" },
  ]

  return (
    <div className="space-y-8">
      <PortalPageHeader
        label="Profile"
        description={`Edit the public profile draft for ${hospital.name}. Changes remain a local draft — publishing to the public directory requires admin verification, which this demo does not simulate.`}
        action={
          <Link
            href={hospitalProfileHref(hospital.slug)}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View public profile
            <ExternalLinkIcon aria-hidden className="size-3.5" />
            <span className="sr-only"> — opens the public hospital page in a new tab</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <HospitalProfileForm
          hospitalId={hospital.id}
          initialValues={{
            name: hospital.name,
            city: hospital.city,
            state: hospital.state,
            facilityType: hospital.facilityType,
            overview: hospital.overview,
          }}
        />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record status</CardTitle>
            </CardHeader>
            <CardContent className="gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Verification</span>
                <VerificationBadge status={hospital.verificationStatus} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Facility type</span>
                <span className="text-right font-medium text-foreground">{hospital.facilityType}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Specialties</span>
                <span className="text-right font-medium text-foreground">
                  {specialtyNames.length} listed
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Treatments</span>
                <span className="text-right font-medium text-foreground">
                  {treatmentNames.length} listed
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Specialties and treatments are managed in the{" "}
                <Link
                  href={ROUTES.hospitalPortal.specialities}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Specialities
                </Link>{" "}
                module; edits here cannot change taxonomy associations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery metadata (demo)</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <ul className="space-y-3">
                {galleryImages.map((image, index) => (
                  <li key={`${image.label}-${index}`} className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={image.file}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {image.label}
                      </span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {image.file}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Demo metadata only — image replacement is not functional in the mock phase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accreditations</CardTitle>
            </CardHeader>
            <CardContent className="gap-2 text-sm">
              {hospital.accreditations.length === 0 ? (
                <p className="text-muted-foreground">No accreditation records in the demo set.</p>
              ) : (
                <ul className="space-y-2">
                  {hospital.accreditations.map((accreditation) => (
                    <li key={accreditation.name} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 text-foreground">
                        {accreditation.name}
                        {accreditation.validUntil ? (
                          <span className="block text-xs text-muted-foreground">
                            valid until {accreditation.validUntil}
                          </span>
                        ) : null}
                      </span>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {accreditation.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Accreditation documents are managed in the{" "}
                <Link
                  href={ROUTES.hospitalPortal.documents}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Documents
                </Link>{" "}
                module.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
