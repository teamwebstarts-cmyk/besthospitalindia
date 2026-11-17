import type { ReactNode } from "react"

import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"

/**
 * Public route-group layout: PublicHeader + main + PublicFooter in a
 * max-w-7xl container. The header is a client component (mobile Sheet +
 * overflow menu); this layout itself stays a Server Component.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8"
      >
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
