import Link from "next/link"

import { Button } from "@/components/ui/button"

export interface ProfileMobileActionBarProps {
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}

/** Fixed actions above the mobile tab bar on provider detail pages. */
export function ProfileMobileActionBar({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: ProfileMobileActionBarProps) {
  return (
    <div
      data-profile-action-bar
      className="fixed inset-x-0 bottom-[3.25rem] z-40 border-t border-border/80 bg-background/95 px-3 py-2 shadow-[0_-4px_20px_rgba(11,61,48,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-background/88 lg:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <Button
          variant="cta"
          className="h-10 flex-1 rounded-full font-semibold shadow-sm"
          render={<Link href={primaryHref} />}
        >
          {primaryLabel}
        </Button>
        <Button
          variant="outline"
          className="h-10 shrink-0 rounded-full px-4 font-medium"
          render={<Link href={secondaryHref} />}
        >
          {secondaryLabel}
        </Button>
      </div>
    </div>
  )
}
