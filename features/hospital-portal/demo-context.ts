/**
 * Hospital portal demo context + scoped selectors — Agent A09.
 *
 * The demo session is the frozen partner fixture pair:
 * - demo user:   `pu-sunrise-owner` (PartnerUser, role owner)
 * - demo hospital: `hosp-sunrise-delhi` (Hospital)
 * linked by `PartnerUser.hospitalId` (types/portal.ts). All module pages read
 * through these pure selectors so dashboard KPI totals reconcile with the
 * exact records the module pages render.
 *
 * Demo scoping decision (documented, not a product rule): the enquiries queue
 * contains enquiries explicitly addressed to the demo hospital
 * (`preferredProviderId`) plus enquiries with NO provider preference whose
 * specialty is listed by the hospital. The appointments queue contains
 * requests against the hospital OR against its associated doctors. Both rules
 * exist only to make the frozen fixture set meaningful for one demo session.
 */

import {
  appointments,
  assessmentsForProvider,
  hospitalById,
  notifications,
  partnerUsers,
  patientEnquiries,
  reviewsForProvider,
} from "@/data";
import { getRelatedDoctors } from "@/lib/search";
import type {
  AppointmentRequest,
  Doctor,
  Hospital,
  HospitalDocument,
  Notification,
  PartnerUser,
  PatientEnquiry,
  RatingAssessment,
  Review,
  VerificationStatus,
} from "@/types";

/** Hospital the demo partner session is signed in as (fixture id). */
export const DEMO_HOSPITAL_ID = "hosp-sunrise-delhi";

/** Demo signed-in partner user (fixture id; role: owner). */
export const DEMO_PARTNER_USER_ID = "pu-sunrise-owner";

/** Resolved demo hospital; guaranteed present in data/hospitals.ts. */
export function getDemoHospital(): Hospital {
  const hospital = hospitalById[DEMO_HOSPITAL_ID];
  if (!hospital) {
    throw new Error(
      "Demo hospital fixture is missing — data contracts (A01) may have changed.",
    );
  }
  return hospital;
}

/** Resolved demo partner user; guaranteed present in data/portal.ts. */
export function getDemoPartnerUser(): PartnerUser {
  const user = partnerUsers.find((u) => u.id === DEMO_PARTNER_USER_ID);
  if (!user) {
    throw new Error(
      "Demo partner user fixture is missing — data contracts (A01) may have changed.",
    );
  }
  return user;
}

// ---------------------------------------------------------------------------
// Enquiries — scoped demo queue
// ---------------------------------------------------------------------------

/**
 * Enquiries relevant to the demo hospital: addressed to it explicitly, or
 * unassigned enquiries in a specialty the hospital lists (demo scoping — see
 * module docblock). Preserves fixture order.
 */
export function demoEnquiries(): PatientEnquiry[] {
  const hospital = getDemoHospital();
  return patientEnquiries.filter((enquiry) => {
    if (enquiry.preferredProviderId === DEMO_HOSPITAL_ID) return true;
    if (enquiry.preferredProviderId === undefined) {
      return hospital.specialties.includes(enquiry.specialty);
    }
    return false;
  });
}

/** Enquiries that still need partner action (not yet responded/closed). */
export function openEnquiries(): PatientEnquiry[] {
  return demoEnquiries().filter(
    (enquiry) => enquiry.status !== "responded" && enquiry.status !== "closed",
  );
}

// ---------------------------------------------------------------------------
// Appointments — scoped demo queue
// ---------------------------------------------------------------------------

/**
 * Appointment requests against the demo hospital OR against doctors
 * associated with it (demo scoping — see module docblock). Preserves fixture
 * order.
 */
export function demoAppointments(): AppointmentRequest[] {
  // A patient booking a doctor is routed to that doctor only. Hospitals see
  // only requests explicitly addressed to their own hospital profile.
  return appointments.filter(
    (appointment) =>
      appointment.providerType === "hospital" &&
      appointment.providerId === DEMO_HOSPITAL_ID,
  );
}

/** Requests the partner still has to answer (requested / under_review). */
export function pendingAppointments(): AppointmentRequest[] {
  return demoAppointments().filter(
    (appointment) =>
      appointment.status === "requested" || appointment.status === "under_review",
  );
}

/**
 * Requests with a preferred date on/after `fromISO` and before `untilISO`
 * (inclusive/exclusive), in any non-terminal state. Used by the dashboard
 * period filter; enquiry rows without a preferred date always stay visible.
 */
export function appointmentsWithinWindow(
  fromISO: string,
  untilISO: string,
): AppointmentRequest[] {
  return demoAppointments().filter((appointment) => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return false;
    }
    const date = appointment.preferredDate;
    return date >= fromISO && date < untilISO;
  });
}

// ---------------------------------------------------------------------------
// Reviews & rating assessments
// ---------------------------------------------------------------------------

/** Hospital reviews for the demo hospital, fixture order. */
export function demoReviews(): Review[] {
  return [...reviewsForProvider("hospital", DEMO_HOSPITAL_ID)];
}

/** Reviews the partner may reply to: published, not yet replied to. */
export function reviewsAwaitingReply(): Review[] {
  return demoReviews().filter(
    (review) => review.status === "published" && review.reply === undefined,
  );
}

/** Rating assessments recorded for the demo hospital (PER/CER, any status). */
export function demoAssessments(): RatingAssessment[] {
  return [...assessmentsForProvider("hospital", DEMO_HOSPITAL_ID)];
}

// ---------------------------------------------------------------------------
// Team — partner users of the demo hospital
// ---------------------------------------------------------------------------

/** Partner users belonging to the demo hospital, fixture order. */
export function demoTeamMembers(): PartnerUser[] {
  return partnerUsers.filter((user) => user.hospitalId === DEMO_HOSPITAL_ID);
}

// ---------------------------------------------------------------------------
// Documents — accreditation-derived rows + typed demo checklist rows
//
// A01 owns `data/` and no centralized HospitalDocument fixture exists yet
// (contract request logged in the A09 report). Until one is provided, the
// checklist is derived here from the hospital's shared accreditation fixtures
// plus demo-only rows typed with the shared `HospitalDocument` contract. The
// VerificationStatus → DocumentStatus mapping below is display-only demo
// mapping: verified→verified, pending→under_review, unverified→submitted,
// rejected→rejected, expired→expired.
// ---------------------------------------------------------------------------

const DOCUMENT_STATUS_BY_VERIFICATION: Record<
  VerificationStatus,
  HospitalDocument["status"]
> = {
  verified: "verified",
  pending: "under_review",
  unverified: "submitted",
  rejected: "rejected",
  expired: "expired",
};

/** One checklist row: shared HospitalDocument shape + demo expiry metadata. */
export interface DemoDocumentRow {
  document: HospitalDocument;
  /** ISO date the document expires, or null when not applicable. */
  expiresAt: string | null;
  /** Where the row came from — shown in the UI as demo provenance. */
  source: "hospital accreditation fixture" | "demo checklist entry";
}

/**
 * Build the demo document checklist for a hospital. Pure: `nowISO` is passed
 * in by the caller so rows render identically on server and client.
 */
export function buildDocumentRows(
  hospital: Hospital,
  nowISO: string,
): DemoDocumentRow[] {
  const now = new Date(nowISO);
  const rows: DemoDocumentRow[] = hospital.accreditations.map(
    (accreditation, index): DemoDocumentRow => ({
      document: {
        id: `demo-doc-accreditation-${index + 1}`,
        hospitalId: hospital.id,
        name: accreditation.name,
        type: "accreditation",
        status: DOCUMENT_STATUS_BY_VERIFICATION[accreditation.status],
        fileLabel: `demo-${accreditation.status}-record.pdf`,
        uploadedAt: hospital.id === DEMO_HOSPITAL_ID ? "2026-09-01" : "2026-09-01",
        reviewedAt: accreditation.status === "verified" ? "2026-09-10" : null,
      },
      expiresAt: accreditation.validUntil ?? null,
      source: "hospital accreditation fixture",
    }),
  );

  // Demo-only legal checklist entries — statuses exercise every list state.
  const demoEntries: Array<{
    name: string;
    type: HospitalDocument["type"];
    status: HospitalDocument["status"];
    uploadedAt: string;
    expiresAt: string | null;
    reviewerNote?: string;
  }> = [
    {
      name: "Hospital registration certificate (demo)",
      type: "registration_certificate",
      status: "verified",
      uploadedAt: "2026-08-20",
      expiresAt: "2029-08-19",
    },
    {
      name: "Clinical establishment licence (demo)",
      type: "clinical_establishment_license",
      status: "under_review",
      uploadedAt: "2026-10-28",
      expiresAt: null,
    },
    {
      name: "Bio-medical waste authorization (demo)",
      type: "bio_medical_waste_authorization",
      status: "submitted",
      uploadedAt: "2025-11-30",
      expiresAt: soonExpiry(now, 21),
    },
    {
      name: "Insurance empanelment record (demo)",
      type: "insurance_empanelment",
      status: "expired",
      uploadedAt: "2025-08-01",
      expiresAt: "2026-10-31",
      reviewerNote: "Demo note: renewal window shown as expired to exercise the expired state.",
    },
  ];

  for (const [index, entry] of demoEntries.entries()) {
    rows.push({
      document: {
        id: `demo-doc-checklist-${index + 1}`,
        hospitalId: hospital.id,
        name: entry.name,
        type: entry.type,
        status: entry.status,
        fileLabel: `demo-${entry.type}.pdf`,
        uploadedAt: entry.uploadedAt,
        reviewedAt: entry.status === "verified" ? entry.uploadedAt : null,
        reviewerNote: entry.reviewerNote,
      },
      expiresAt: entry.expiresAt,
      source: "demo checklist entry",
    });
  }

  return rows;
}

/** ISO date `days` ahead of `now` (demo expiry generator). */
function soonExpiry(now: Date, days: number): string {
  const target = new Date(now);
  target.setDate(target.getDate() + days);
  return target.toISOString().slice(0, 10);
}

/** Rows needing attention: pending review, rejected, expired, or expiring soon. */
export function documentsNeedingAttention(
  rows: DemoDocumentRow[],
  nowISO: string,
): DemoDocumentRow[] {
  const horizonMs = 90 * 24 * 60 * 60 * 1000;
  const nowMs = new Date(nowISO).getTime();
  return rows.filter((row) => {
    if (row.document.status === "expired" || row.document.status === "rejected") {
      return true;
    }
    if (row.document.status === "under_review" || row.document.status === "submitted") {
      return true;
    }
    if (row.expiresAt) {
      const expiryMs = new Date(row.expiresAt).getTime();
      if (expiryMs - nowMs <= horizonMs) return true;
    }
    return false;
  });
}

// ---------------------------------------------------------------------------
// Notifications — partner-addressed demo notifications (FR-017 mock states)
// ---------------------------------------------------------------------------

/** Demo notifications addressed to the demo partner user or their hospital. */
export function demoPartnerNotifications(): Notification[] {
  return notifications.filter(
    (notification) =>
      notification.audience === "hospital_partner" &&
      (notification.recipientId === null ||
        notification.recipientId === DEMO_PARTNER_USER_ID),
  );
}

// ---------------------------------------------------------------------------
// Profile completion (demo metadata, derived deterministically)
// ---------------------------------------------------------------------------

export interface ProfileCompletion {
  completed: number;
  total: number;
  percent: number;
  /** Human labels of the checks, in display order, with their state. */
  checks: Array<{ label: string; complete: boolean }>;
}

/**
 * Demo profile-completion metric derived purely from the hospital fixture.
 * Labelled "demo metadata" in the UI; not a platform business rule.
 */
export function profileCompletion(hospital: Hospital): ProfileCompletion {
  const checks = [
    { label: "Overview text", complete: hospital.overview.trim().length >= 40 },
    { label: "Specialties listed", complete: hospital.specialties.length > 0 },
    { label: "Treatments listed", complete: hospital.treatments.length > 0 },
    {
      label: "Verified accreditation",
      complete: hospital.accreditations.some((a) => a.status === "verified"),
    },
    { label: "Facility type set", complete: hospital.facilityType.trim().length > 0 },
    { label: "Cover image set", complete: hospital.image.trim().length > 0 },
  ];
  const completed = checks.filter((check) => check.complete).length;
  return {
    completed,
    total: checks.length,
    percent: Math.round((completed / checks.length) * 100),
    checks,
  };
}

// ---------------------------------------------------------------------------
// Associated doctors
// ---------------------------------------------------------------------------

/** Doctors currently associated with the demo hospital (two-way consistent). */
export function demoAssociatedDoctors(): Doctor[] {
  return getRelatedDoctors(DEMO_HOSPITAL_ID);
}
