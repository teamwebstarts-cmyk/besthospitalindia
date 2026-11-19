import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { EnquiryForm } from "@/features/consultations/enquiry-form";
import { CircleCheckIcon, XIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Consultation",
  description:
    "Request a free consultation on BestHospitalIndia — describe your concern, choose a specialty, and hear back from our coordination team.",
};

/**
 * /free-consultation — A07.
 *
 * Consultation landing + mock enquiry form. Server component;
 * the form itself is the only client island. Scope, exclusions and charges
 * copy follows the pages/14 spec framing; items the spec does not specify are
 * marked as pending product confirmation.
 */
export default function FreeConsultationPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 pt-1 pb-4 sm:gap-5 sm:py-6 lg:py-8">
      <header className="flex flex-col gap-0.5 sm:gap-2">
        <Breadcrumbs
          className="hidden md:block"
          items={[
            { label: "Home", href: ROUTES.public.home },
            { label: "Free Consultation" },
          ]}
        />
        <h1 className="text-[1.35rem] leading-[1.2] font-bold tracking-tight text-balance sm:text-3xl sm:leading-tight">
          <span className="text-foreground">Free consultation</span>
          <span className="mt-1 block text-sm font-medium leading-snug text-muted-foreground sm:mt-0 sm:ml-2 sm:inline sm:text-[length:inherit] sm:font-normal sm:text-muted-foreground/90">
            <span className="hidden sm:inline" aria-hidden>
              {" "}
              ·{" "}
            </span>
            Ask before you decide
          </span>
        </h1>
      </header>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base">What&apos;s included</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="flex flex-col gap-2 text-sm leading-snug">
                <ScopeItem>Review of your concern and any reports you share</ScopeItem>
                <ScopeItem>Guidance on specialties and listed providers</ScopeItem>
                <ScopeItem>Free indicative opinion on possible next steps</ScopeItem>
                <ScopeItem>Timeline estimate when we confirm your request</ScopeItem>
              </ul>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Not included</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="flex flex-col gap-2 text-sm leading-snug">
                <ScopeItem excluded>
                  Treatment, procedures, medicines and hospital stays (provider bills separately)
                </ScopeItem>
                <ScopeItem excluded>Travel, visa and accommodation support</ScopeItem>
                <ScopeItem excluded>Follow-up consultations after the first opinion</ScopeItem>
              </ul>
              <p className="mt-3 text-xs leading-snug text-muted-foreground">
                Not medical advice. Submitting the form is not a confirmed appointment until a
                provider agrees. In an emergency, use local emergency services.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ScopeItem({ children, excluded = false }: { children: ReactNode; excluded?: boolean }) {
  return (
    <li className="grid grid-cols-[1.125rem_minmax(0,1fr)] items-start gap-x-2 gap-y-0">
      {excluded ? (
        <XIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <CircleCheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
      )}
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}
