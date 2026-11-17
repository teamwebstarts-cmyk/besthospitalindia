/**
 * Demo session identity for the Doctor Portal (A10).
 *
 * The mock phase has no real authentication (06-technical-architecture.md:
 * "Portal routes should show role context; mock access guards may redirect to
 * demo sign-in, but must be labelled demo-only"). The /auth entry point exposes
 * no doctor sign-in flow, so the portal renders a fixed demo identity and
 * labels it everywhere as demo-only.
 *
 * Dr. Meera Joshi (doc-meera-joshi) is used because she is the only doctor
 * fixture with a record in every A10 module:
 * - appointment request APT-3C4D (confirmed, video, trt-asthma-care)
 * - assigned consultation enquiry ENQ-2N6P (preferredProviderId = her id)
 * - published, unanswered review rev-007 (response composer target)
 * - verified profile + verified registration; PER published, MER not_assessed
 *   (exercises the "no approved score" honesty rule end to end)
 * - two hospital associations (two-way consistent with Hospital.doctorIds)
 *
 * This is a presentation choice over the frozen A01 fixtures — not a business
 * rule. All data rendered about her is fictional demo data.
 */

import { doctorById } from "@/data"

export const DEMO_DOCTOR_ID = "doc-meera-joshi"

/** The demo doctor fixture, or undefined if the A01 fixture id ever changes. */
export function getSessionDoctor() {
  return doctorById[DEMO_DOCTOR_ID]
}
