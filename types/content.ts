/**
 * Content domain contracts (taxonomy) — BestHospitalIndia (A01).
 *
 * Specialty and Treatment are not separately listed in
 * implementation/09-data-models-and-mock-data.md, but Hospital/Doctor/Facility
 * reference specialties and treatments by id and the docs require ≥10 of each
 * (09 "Mock dataset rules"). Shapes are therefore designed minimally and marked
 * PROPOSED.
 */

/**
 * PROPOSED — pending orchestrator review (taxonomy shape is not specified in the 09 doc;
 * minimal fields for directory discovery and card display).
 */
export interface Specialty {
  id: string;
  slug: string;
  name: string;
  /** One-line neutral description; NO clinical claims. */
  description: string;
}

/**
 * PROPOSED — pending orchestrator review (taxonomy shape is not specified in the 09 doc;
 * minimal fields for treatment discovery and detail pages).
 */
export interface Treatment {
  id: string;
  slug: string;
  name: string;
  /** Owning specialty id (see data/specialties.ts). */
  specialtyId: string;
  /** One-line neutral description; NO clinical claims or outcomes. */
  description: string;
}
