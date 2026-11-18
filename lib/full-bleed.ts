/**
 * Escape a padded, max-width main column to true viewport width.
 * Prefer this over `left-1/2 -translate-x-1/2` inside constrained ancestors.
 */
export const fullBleedClassName =
  "relative mr-[calc(50%-50vw)] ml-[calc(50%-50vw)] w-screen max-w-[100vw]"