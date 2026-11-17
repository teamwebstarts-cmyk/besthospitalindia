/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Treatment fixtures (ids referenced by Hospital/Doctor records). Every specialty
 * in data/specialties.ts has at least one treatment. Shape is PROPOSED
 * (types/content.ts) — pending orchestrator review. Descriptions contain NO
 * clinical claims or outcome promises.
 */

import type { Treatment } from '@/types';

export const treatments = [
  {
    id: 'trt-coronary-angioplasty',
    slug: 'coronary-angioplasty',
    name: 'Coronary angioplasty',
    specialtyId: 'spec-cardiology',
    description: 'Hospital programme listing for coronary angioplasty (demo taxonomy entry).',
  },
  {
    id: 'trt-bypass-surgery',
    slug: 'bypass-surgery',
    name: 'Coronary bypass surgery',
    specialtyId: 'spec-cardiology',
    description: 'Hospital programme listing for coronary bypass surgery (demo taxonomy entry).',
  },
  {
    id: 'trt-chemotherapy',
    slug: 'chemotherapy',
    name: 'Chemotherapy day care',
    specialtyId: 'spec-oncology',
    description: 'Hospital programme listing for chemotherapy day care (demo taxonomy entry).',
  },
  {
    id: 'trt-knee-replacement',
    slug: 'knee-replacement',
    name: 'Knee replacement',
    specialtyId: 'spec-orthopaedics',
    description: 'Hospital programme listing for knee replacement (demo taxonomy entry).',
  },
  {
    id: 'trt-stroke-rehab',
    slug: 'stroke-rehabilitation',
    name: 'Post-stroke rehabilitation',
    specialtyId: 'spec-neurology',
    description: 'Programme listing for post-stroke rehabilitation (demo taxonomy entry).',
  },
  {
    id: 'trt-liver-transplant',
    slug: 'liver-transplant',
    name: 'Liver transplant programme',
    specialtyId: 'spec-gastroenterology',
    description: 'Hospital programme listing for liver transplant work-up (demo taxonomy entry).',
  },
  {
    id: 'trt-dialysis',
    slug: 'dialysis',
    name: 'Dialysis care',
    specialtyId: 'spec-nephrology-urology',
    description: 'Facility listing for maintenance dialysis sessions (demo taxonomy entry).',
  },
  {
    id: 'trt-asthma-care',
    slug: 'asthma-airways-care',
    name: 'Asthma & airways care',
    specialtyId: 'spec-pulmonology',
    description: 'Programme listing for asthma and airways care (demo taxonomy entry).',
  },
  {
    id: 'trt-cataract-surgery',
    slug: 'cataract-surgery',
    name: 'Cataract surgery',
    specialtyId: 'spec-ophthalmology',
    description: 'Facility listing for cataract surgery (demo taxonomy entry).',
  },
  {
    id: 'trt-maternity-care',
    slug: 'maternity-care',
    name: 'Maternity care package',
    specialtyId: 'spec-maternity-neonatal',
    description: 'Hospital programme listing for maternity care (demo taxonomy entry).',
  },
] as const satisfies readonly Treatment[];

/** Fast id → Treatment lookup for selectors and fixtures. */
export const treatmentById: Readonly<Record<string, Treatment>> = Object.freeze(
  Object.fromEntries(treatments.map((t) => [t.id, t])),
);

/** Slug → Treatment lookup used by getTreatmentBySlug. */
export const treatmentBySlug: Readonly<Record<string, Treatment>> = Object.freeze(
  Object.fromEntries(treatments.map((t) => [t.slug, t])),
);
