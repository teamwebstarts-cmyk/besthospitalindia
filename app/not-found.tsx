import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { EmptyState } from "@/components/shared/empty-state"
import { buttonVariants } from "@/components/ui/button"

/**
 * Global 404 (unmatched URLs and notFound()). Renders inside the root layout
 * only, so it composes the public chrome itself (PublicHeader + PublicFooter,
 * same as the (public) route-group layout) instead of shipping bare content —
 * A14-02 / BUG-011.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
      >
        <EmptyState
          icon={CompassIcon}
          title="Page not found"
          description="The page you are looking for doesn't exist or may have moved. Check the URL or continue exploring hospitals, doctors and facilities."
          className="border-none py-8"
          action={{ label: "Go to homepage", href: "/" }}
        >
          <Link href="/hospitals" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Browse hospitals
          </Link>
        </EmptyState>
      </main>
      <PublicFooter />
    </div>
  )
}
