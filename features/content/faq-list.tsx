"use client"

import { MinusIcon, PlusIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Faq } from "@/types"
import { cn } from "@/lib/utils"

export interface FaqListEntry {
  id: string
  question: string
  answer: React.ReactNode
  order: number
  category?: Faq["category"]
}

export interface FaqListProps {
  /** FAQ fixtures from @/data (portal.ts), sorted by `order`. */
  faqs: readonly FaqListEntry[]
  className?: string
  /** `cards` — bordered white rows with primary question text (home / marketing). */
  variant?: "default" | "cards"
}

/**
 * Accessible FAQ accordion (client leaf; the accordion primitive is a client
 * component). Multiple items can stay open. Sorts by the fixture `order` field.
 */
export function FaqList({ faqs, className, variant = "default" }: FaqListProps) {
  const sorted = [...faqs].sort((a, b) => a.order - b.order)
  const isCards = variant === "cards"

  return (
    <Accordion
      multiple
      className={cn(isCards ? "flex flex-col gap-3" : undefined, className)}
    >
      {sorted.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={faq.id}
          className={cn(
            isCards &&
              "interactive-surface rounded-lg border border-primary/20 border-b-primary/20 bg-white transition-colors hover:bg-primary/[0.06] not-last:!border-b-primary/20"
          )}
        >
          <AccordionTrigger
            className={cn(
              isCards
                ? "items-center border-0 px-4 py-4 text-left text-[15px] font-semibold text-primary hover:no-underline sm:px-5 sm:text-base [&_[data-slot=accordion-trigger-icon]]:hidden"
                : "text-left text-base font-medium"
            )}
          >
            {faq.question}
            {isCards ? (
              <>
                <PlusIcon
                  aria-hidden
                  className="ml-3 size-5 shrink-0 text-primary group-aria-expanded/accordion-trigger:hidden"
                />
                <MinusIcon
                  aria-hidden
                  className="ml-3 hidden size-5 shrink-0 text-primary group-aria-expanded/accordion-trigger:inline"
                />
              </>
            ) : null}
          </AccordionTrigger>
          <AccordionContent
            className={cn(
              isCards && "px-4 pt-0 pb-4 sm:px-5",
              "text-sm leading-relaxed text-muted-foreground"
            )}
          >
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}