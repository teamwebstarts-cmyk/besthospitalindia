import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * Invisible profile link covering a listing card. Stack action buttons above
 * with `relative z-[1]` so their hrefs stay separate from the card destination.
 */
export function CardStretchLink({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      tabIndex={-1}
      className={cn("card-stretch-link absolute inset-0 z-[1] rounded-[inherit]", className)}
    />
  )
}