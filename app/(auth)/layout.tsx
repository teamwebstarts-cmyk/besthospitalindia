import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon, SparklesIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in or register on BestHospitalIndia. Demo authentication only — no real accounts are created.",
}

/**
 * Auth route-group layout: minimal header (back link + brand), centered
 * content, minimal footer. Deliberately separate from the (public) group so
 * /auth never renders the full PublicHeader/PublicFooter chrome.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            Back to BestHospitalIndia
          </Link>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <SparklesIcon aria-hidden className="size-3.5" />
            IUF Supported Initiative
          </p>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8"
      >
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Partner login is for hospitals and doctors. Patients book without an account.
        </div>
      </footer>
    </div>
  )
}
