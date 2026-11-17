/**
 * FICTIONAL DEMO DATA — not real providers, ratings or outcomes.
 *
 * Specialty taxonomy fixtures (ids referenced by Hospital/Doctor/Facility records).
 * Shape is PROPOSED (types/content.ts) — pending orchestrator review.
 * Descriptions are neutral discovery copy; they contain NO clinical claims.
 */

import type { Specialty } from '@/types';

export const specialties = [
  {
    id: 'spec-cardiology',
    slug: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and blood-vessel care services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-oncology',
    slug: 'oncology',
    name: 'Oncology',
    description: 'Cancer care services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-orthopaedics',
    slug: 'orthopaedics',
    name: 'Orthopaedics',
    description: 'Bone, joint and spine services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-neurology',
    slug: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous-system services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-gastroenterology',
    slug: 'gastroenterology',
    name: 'Gastroenterology',
    description: 'Digestive-system services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-nephrology-urology',
    slug: 'nephrology-urology',
    name: 'Nephrology & Urology',
    description: 'Kidney and urinary-care services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-pulmonology',
    slug: 'pulmonology',
    name: 'Pulmonology',
    description: 'Lung and breathing-related services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-endocrinology',
    slug: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormone and metabolic-care services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-ophthalmology',
    slug: 'ophthalmology',
    name: 'Ophthalmology',
    description: 'Eye-care services offered by listed providers (demo taxonomy).',
  },
  {
    id: 'spec-maternity-neonatal',
    slug: 'maternity-neonatal',
    name: 'Maternity & Neonatal',
    description: 'Pregnancy, birth and newborn services offered by listed providers (demo taxonomy).',
  },
] as const satisfies readonly Specialty[];

/** Fast id → Specialty lookup for selectors and fixtures. */
export const specialtyById: Readonly<Record<string, Specialty>> = Object.freeze(
  Object.fromEntries(specialties.map((s) => [s.id, s])),
);

/** Slug → Specialty lookup used by getSpecialtyBySlug-style selectors. */
export const specialtyBySlug: Readonly<Record<string, Specialty>> = Object.freeze(
  Object.fromEntries(specialties.map((s) => [s.slug, s])),
);
