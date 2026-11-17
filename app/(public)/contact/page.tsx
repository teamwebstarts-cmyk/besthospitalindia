import type { Metadata } from "next"

import { PageHeader, PageSection, ContentLinkGroup } from "@/features/content"
import { ContactForm } from "@/features/content/contact-form"
import { contactContent } from "@/features/content/home-content"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach the BestHospitalIndia team: patient support, hospital and doctor partnerships, or the IUF-supported free consultation flow. Demo contact details and a mock enquiry form.",
}

const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Contact" }]

export default function ContactPage() {
  return (
    <div className="space-y-10 py-8">
      <PageHeader
        title="Contact us"
        description={contactContent.intro}
        breadcrumbItems={breadcrumbItems}
      />

      <PageSection
        title="Contact routes"
        description="Pick the channel that matches your question so it reaches the right demo team."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contactContent.channels.map((channel) => (
            <article
              key={channel.id}
              className="flex h-full flex-col gap-2 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10"
            >
              <h3 className="font-semibold text-foreground">{channel.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {channel.body}
              </p>
              {"href" in channel && channel.href ? (
                <p className="mt-2 text-sm">
                  <a
                    href={channel.href}
                    className="font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {channel.label}
                  </a>
                </p>
              ) : (
                <p className="mt-2 text-sm font-medium text-foreground">
                  {channel.label}
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {contactContent.note}
        </p>
      </PageSection>

      <PageSection
        title="General enquiry form"
        description="For anything that does not fit the channels above. This form is a demo — see the notice inside."
        id="enquiry-form"
      >
        <ContactForm />
      </PageSection>

      <ContentLinkGroup
        title="Supporting links"
        links={[
          {
            label: "Free consultation request (IUF-supported)",
            href: "/free-consultation",
          },
          { label: "For Hospitals", href: "/for-hospitals" },
          { label: "For Doctors", href: "/for-doctors" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
      />
    </div>
  )
}
