import { RESEARCH_COVER_IMAGES } from "./constants";

/** Unsplash IDs that were removed or return 404 — remap at read time for seeded DB rows. */
const BROKEN_UNSPLASH_IDS = ["photo-1485291571156-775bc4f007af"];

export function normalizeResearchCoverImage(url: string | null | undefined): string | null {
  if (!url) return null;
  if (BROKEN_UNSPLASH_IDS.some((id) => url.includes(id))) {
    return RESEARCH_COVER_IMAGES.showroom;
  }
  return url;
}
