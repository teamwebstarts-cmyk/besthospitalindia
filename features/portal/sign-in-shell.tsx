import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowLeftIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface PortalSignInShellProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  highlights?: readonly string[]
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function PortalSignInShell({
  icon: Icon,
  eyebrow,
  title,
  description,
  highlights = [],
  children,
  footer,
  className,
}: PortalSignInShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col bg-linear-to-br from-primary/5 via-background to-muted/30",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/12%,transparent)]"
      />
      <header className="relative z-10 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
            Back to site
          </Link>
          <p className="hidden text-xs text-muted-foreground sm:block">Secure portal access</p>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:py-16">
        <section className="mb-8 space-y-5 lg:mb-0 lg:max-w-md lg:flex-1">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Icon className="size-6" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
          </div>
          {highlights.length > 0 ? (
            <ul className="space-y-2.5 pt-1">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <Card className="w-full border-border/80 shadow-lg lg:max-w-md lg:flex-1 lg:shadow-xl">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="space-y-1 lg:hidden">
              <p className="text-sm font-medium text-foreground">Sign in</p>
              <p className="text-sm text-muted-foreground">Use the credentials shared with your team.</p>
            </div>
            {children}
            {footer ? <div className="border-t border-border pt-4">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}