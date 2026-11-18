/** Shared easing + class tokens for landing-page motion (CSS-first). */

export const MOTION_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/** Soft hover lift for cards, tiles and directory rows on the home page. */
export const homeInteractiveSurfaceClassName =
  "interactive-surface will-change-transform"

/** Link/tile hover: colour shift without vertical lift (dense grids). */
export const homeInteractiveTileClassName =
  "transition-[transform,box-shadow,border-color,colors] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"