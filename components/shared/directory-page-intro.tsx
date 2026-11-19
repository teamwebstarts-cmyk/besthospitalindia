import { cn } from "@/lib/utils"

export interface DirectoryPageIntroProps {
  title: string
  description: string
  className?: string
}

/** Listing pages — single title + one-line blurb (no breadcrumb duplicate). */
export function DirectoryPageIntro({
  title,
  description,
  className,
}: DirectoryPageIntroProps) {
  return (
    <header className={cn("max-w-3xl space-y-2", className)}>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="text-xs leading-snug text-muted-foreground sm:text-base sm:leading-relaxed">
        {description}
      </p>
    </header>
  )
}