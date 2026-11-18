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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useInViewOnce<T extends HTMLElement>(margin = "0px 0px -8% 0px") {
  const ref = useRef<T | null>(null)
  // Always paint content visible first — never hide hero/sections behind opacity-0.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: margin }
    )

    observer.observe(node)

    const fallback = window.setTimeout(() => setVisible(true), 1200)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [margin])

  return { ref, visible }
}

export interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Extra delay before the entrance transition (ms). */
  delayMs?: number
  as?: ElementType
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
}: ScrollRevealProps) {
  const { ref, visible } = useInViewOnce<HTMLDivElement>()

  return (
    <Component
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-100",
        className
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
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
  const { ref, visible } = useInViewOnce<HTMLDivElement>()

  const items = Children.toArray(children)

  return (
    <Component ref={ref} className={className}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child

        const element = child as ReactElement<{ className?: string; style?: React.CSSProperties }>
        const delay = visible ? index * staggerMs : 0

        return cloneElement(element, {
          className: cn(
            element.props.className,
            "transition-[opacity,transform] duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-100"
          ),
          style: {
            ...element.props.style,
            transitionDelay: `${delay}ms`,
          },
        })
      })}
    </Component>
  )
}