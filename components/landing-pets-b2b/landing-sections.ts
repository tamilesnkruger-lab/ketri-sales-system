export const landingSectionOrder = [
  "hero",
  "opportunity",
  "market",
  "discovery",
  "collection",
  "how-it-works",
  "space",
  "final-cta"
] as const;

export type LandingSectionId = (typeof landingSectionOrder)[number];