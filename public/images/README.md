/**
 * A02 — image placeholder notes.
 *
 * The mock dataset references local placeholder art for every hospital image
 * and doctor photo (types/provider.ts: "Local neutral placeholder path; no
 * hotlinked assets in the mock phase"). The A02 public-content agent generated
 * one neutral SVG per referenced path (22 files) by stamping a generic demo
 * placeholder. These are NOT branding assets — replace with real art only
 * after owner approval.
 *
 * - public/images/hospitals/<slug-stem>.svg (8 files, 640×360)
 * - public/images/doctors/<slug-stem>.svg (12 files, 160×160)
 * - placeholder.svg in each folder is the master template used to derive them
 *   (delete-safe once per-record art replaces them).
 */
