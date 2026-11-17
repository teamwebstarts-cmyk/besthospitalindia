"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Faq } from "@/types"

export interface FaqListProps {
  /** FAQ fixtures from @/data (portal.ts), sorted by `order`. */
  faqs: readonly Faq[]
  className?: string
}

/**
 * Accessible FAQ accordion (client leaf; the accordion primitive is a client
 * component). Multiple items can stay open. Sorts by the fixture `order` field.
 */
export function FaqList({ faqs, className }: FaqListProps) {
  const sorted = [...faqs].sort((a, b) => a.order - b.order)

  return (
    <Accordion multiple className={className}>
      {sorted.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-left text-base font-medium">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
