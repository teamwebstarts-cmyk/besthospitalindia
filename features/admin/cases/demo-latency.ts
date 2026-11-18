/**
 * Simulated-latency helper for A12 admin demo actions.
 *
 * MOCK ONLY — matches the shared `lib/mock-actions.ts` latency posture
 * (300–600 ms) so admin queue updates feel like the rest of the demo build.
 * Nothing is persisted anywhere. Extracted locally because `mock-actions.ts`
 * does not export its internal delay helper and A12 must not modify shared
 * A01 files.
 */

const LATENCY_MIN_MS = 300
const LATENCY_MAX_MS = 600

export function delay(ms?: number): Promise<void> {
  const resolved =
    ms ?? LATENCY_MIN_MS + Math.floor(Math.random() * (LATENCY_MAX_MS - LATENCY_MIN_MS + 1))
  return new Promise((resolve) => setTimeout(resolve, resolved))
}
