import "server-only"

import { revalidateTag } from "next/cache"

/** Shared tag for public catalogue pages backed by `unstable_cache`. */
export const CATALOGUE_PUBLIC_TAG = "catalogue-public"

export function revalidatePublicCatalogue(): void {
  revalidateTag(CATALOGUE_PUBLIC_TAG, "max")
}