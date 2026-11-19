import type { ReactNode } from "react"

import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicMobileTabBar } from "@/components/layout/public-mobile-tab-bar"

/**
 * Public route-group layout: PublicHeader + main + PublicFooter in a
 * max-w-7xl container. The header is a client component (mobile Sheet +
 * overflow menu); bottom tabs are client-only below lg. This layout stays a
 * Server Component.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background max-lg:pb-[calc(3.25rem+env(safe-area-inset-bottom,0px))]">
      <PublicHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-7xl flex-1 px-4 max-lg:pt-0 sm:px-6 lg:px-8"
      >
        {children}
      </main>
      <PublicFooter />
      <PublicMobileTabBar />
    </div>
  )
}
