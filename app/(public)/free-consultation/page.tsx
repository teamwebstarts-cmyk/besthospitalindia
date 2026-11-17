import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { EnquiryForm } from "@/features/consultations/enquiry-form";
import { IufInitiativeBanner } from "@/features/consultations/iuf-initiative-banner";
import { CircleCheckIcon, InfoIcon, XIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Consultation",
  description:
    "Request a free consultation on BestHospitalIndia, an International Urban Forum Supported Initiative demo. Describe your concern, pick a specialty and preferred date — demo only, no real request is submitted.",
};

/**
 * /free-consultation — A07.
 *
 * IUF-supported consultation landing + mock enquiry form. Server component;
 * the form itself is the only client island. Scope, exclusions and charges
 * copy follows the pages/14 spec framing; items the spec does not specify are
 * marked as pending product confirmation.
 */
export default function FreeConsultationPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.public.home },
          { label: "Free Consultation" },
        ]}
      />

      <header className="flex flex-col gap-4">
        <IufInitiativeBanner />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Free consultation — ask before you decide
          </h1>
          <p className="max-w-3xl text-sm text-balance text-muted-foreground sm:text-base">
            Share your concern and reports with the demo coordination desk. The consultation
            itself is free; any treatment, travel or hospital costs that may follow are always
            separate and would be confirmed with you in advance.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section aria-labelledby="consultation-form-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="consultation-form-heading" className="sr-only">
            Consultation request form
          </h2>
          <EnquiryForm />
        </section>

        <aside aria-labelledby="consultation-side-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="consultation-side-heading" className="sr-only">
            About this free consultation
          </h2>

          <Card size="sm">
            <CardHeader>
              <CardTitle>What the free consultation covers</CardTitle>
              <CardDescription>Scope of the programme (demo framing).</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5 text-sm">
                <ScopeItem>
                  A review of the concern, reports and preferences you share in this form.
                </ScopeItem>
                <ScopeItem>
                  Guidance on which listed specialties or demo providers may be relevant.
                </ScopeItem>
                <ScopeItem>
                  An indicative opinion on next steps — opinions are provided free of charge.
                </ScopeItem>
                <ScopeItem>
                  Estimated timelines for the future admin-review and provider-response steps
                  (documented future states, not part of this demo).
                </ScopeItem>
              </ul>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Exclusions &amp; possible charges</CardTitle>
              <CardDescription>What is not included.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5 text-sm">
                <ScopeItem excluded>
                  The consultation opinion is free; treatments, procedures, medicines and hospital
                  stays are separate and billable by the provider.
                </ScopeItem>
                <ScopeItem excluded>
                  Travel, visa and accommodation support is a distinct paid service, not part of
                  this consultation.
                </ScopeItem>
                <ScopeItem excluded>
                  Follow-up consultations after the first free opinion may be chargeable — exact
                  wording pending product confirmation.
                </ScopeItem>
                <ScopeItem excluded>
                  Any third-party charges (diagnostics, document couriering) are possible and
                  would always be confirmed with you first — pending product confirmation.
                </ScopeItem>
              </ul>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Eligibility</CardTitle>
              <CardDescription>Who can use the demo form.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5 text-sm">
                <ScopeItem>
                  Anyone exploring care options for themselves or a family member.
                </ScopeItem>
                <ScopeItem>
                  International patients considering treatment in India (demo context).
                </ScopeItem>
                <ScopeItem>
                  Additional eligibility rules: pending product confirmation — no criteria are
                  invented for this demo.
                </ScopeItem>
              </ul>
            </CardContent>
          </Card>

          <Alert>
            <InfoIcon />
            <AlertTitle>Medical disclaimer</AlertTitle>
            <AlertDescription>
              This page and its form are part of a demo platform. Nothing here is medical advice,
              no diagnosis is made, and no real consultation, booking or assignment takes place.
              In a real emergency, contact your local emergency services.
            </AlertDescription>
          </Alert>

          <Separator className="lg:hidden" />

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Demo data is fictional</Badge>
            <Badge variant="outline">No uploads leave your browser</Badge>
            <Badge variant="outline">IUF Supported Initiative</Badge>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ScopeItem({ children, excluded = false }: { children: ReactNode; excluded?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      {excluded ? (
        <XIcon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        />
      ) : (
        <CircleCheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
      )}
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}
