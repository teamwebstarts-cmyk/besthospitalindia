/**
 * FaqList — accessible expand/collapse FAQ (Agent A06).
 *
 * Contract source: implementation/08-component-catalog.md ("FAQList").
 * Purely presentational: renders static demo copy from the caller over the
 * shared Accordion primitive. No state, no data fetching.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqListProps {
  items: readonly FaqItem[]
  className?: string
}

export function FaqList({ items, className }: FaqListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Accordion className={cn("w-full", className)}>
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
