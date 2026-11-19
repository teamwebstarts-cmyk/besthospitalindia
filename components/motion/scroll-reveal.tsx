"use client"

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const DEFAULT_STAGGER_MS = 72
const REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * SSR paints visible; after mount (when motion is allowed) content starts
 * slightly below and fades in once in view — avoids a permanent hidden state.
 */
function useRevealInViewOnce<T extends HTMLElement>(margin = "0px 0px -8% 0px") {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(true)
  const [motionActive, setMotionActive] = useState(false)

  useEffect(() => {
    let observer: IntersectionObserver | undefined
    let fallback = 0
    let frame = 0

    // Defer all state updates to a frame so React never sees a synchronous
    // setState inside the effect body (which would cause cascading renders).
    frame = requestAnimationFrame(() => {
      if (prefersReducedMotion()) {
        setVisible(true)
        setMotionActive(false)
        return
      }

      setMotionActive(true)
      setVisible(false)

      const node = ref.current
      if (!node) {
        setVisible(true)
        return
      }

      const markVisible = () => setVisible(true)

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            markVisible()
            observer?.disconnect()
          }
        },
        { threshold: 0.06, rootMargin: margin },
      )

      observer.observe(node)

      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        requestAnimationFrame(() => markVisible())
      }

      fallback = window.setTimeout(markVisible, 1400)
    })

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.clearTimeout(fallback)
    }
  }, [margin])

  const awaitingReveal = motionActive && !visible

  return { ref, visible, awaitingReveal }
}

export interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Extra delay before the entrance transition (ms). */
  delayMs?: number
  as?: ElementType
  id?: string
}

/**
 * Soft fade + rise when the block enters the viewport (once). Respects
 * `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  as: Component = "div",
  id,
}: ScrollRevealProps) {
  const { ref, awaitingReveal } = useRevealInViewOnce<HTMLDivElement>()

  return (
    <Component
      ref={ref}
      id={id}
      className={cn(
        "transition-[opacity,transform] duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        awaitingReveal
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100",
        className,
      )}
      style={{
        transitionTimingFunction: REVEAL_EASE,
        transitionDelay: awaitingReveal ? "0ms" : `${delayMs}ms`,
      }}
    >
      {children}
    </Component>
  )
}

export interface StaggerRevealProps {
  children: ReactNode
  className?: string
  /** Stagger step between direct children (ms). */
  staggerMs?: number
  as?: ElementType
}

/**
 * Staggers direct children (e.g. `<li>` in a grid). Parent must be the grid
 * container (`ul` / `div` with `grid`).
 */
export function StaggerReveal({
  children,
  className,
  staggerMs = DEFAULT_STAGGER_MS,
  as: Component = "div",
}: StaggerRevealProps) {
  const { ref, visible, awaitingReveal } = useRevealInViewOnce<HTMLDivElement>()

  const items = Children.toArray(children)

  return (
    <Component ref={ref} className={className}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child

        const element = child as ReactElement<{ className?: string; style?: React.CSSProperties }>
        const delay = !awaitingReveal && visible ? index * staggerMs : 0

        return cloneElement(element, {
          className: cn(
            element.props.className,
            "transition-[opacity,transform] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
            awaitingReveal
              ? "translate-y-4 opacity-0"
              : "translate-y-0 opacity-100",
          ),
          style: {
            ...element.props.style,
            transitionTimingFunction: REVEAL_EASE,
            transitionDelay: `${delay}ms`,
          },
        })
      })}
    </Component>
  )
}