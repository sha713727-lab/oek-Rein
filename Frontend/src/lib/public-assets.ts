/** Deleted / superseded public assets → current Saddlera files. */
const LEGACY_PUBLIC_ASSETS: Record<string, string> = {
  "/assets/images/women.jpg": "/assets/images/saddle_hero.jpg",
  "/assets/images/women.png": "/assets/images/saddle_hero.jpg",
  "/assets/images/aminoAcidGelCleanser.png": "/assets/images/western_floral_saddle.png",
  "/assets/images/lumieNightCream.png": "/assets/images/western_floral_bridle.png",
  "/assets/images/cocoVelvetBodyPolish.png": "/assets/images/saddlera_leather_care.png",
  "/assets/images/pdrnSerum.png": "/assets/images/western_floral_halter.png",
  "/assets/images/clgnCollagenPeelOffMask.png": "/assets/images/western_floral_new_arrivals.png",
  "/assets/images/vitaminCRadianceSerum.png": "/assets/images/western_floral_saddle.png",
  "/assets/images/newArrival.jpg": "/assets/images/western_floral_new_arrivals.png",
  "/assets/images/zermaeWordmark.png": "/assets/images/saddlera_wordmark.jpg",
  "/assets/images/zermaeWordmarkOnLight.png": "/assets/images/saddlera_wordmark.jpg",
  "/assets/images/zermaeCaps.png": "/assets/images/saddlera_caps.jpg",
  "/assets/images/zermaeCapsOnLight.png": "/assets/images/saddlera_caps.jpg",
  // Prior product paths → current transparent cutouts
  "/assets/images/premium_saddle.jpg": "/assets/images/western_floral_saddle.png",
  "/assets/images/premium_saddle.png": "/assets/images/western_floral_saddle.png",
  "/assets/images/leather_bridle.jpg": "/assets/images/western_floral_bridle.png",
  "/assets/images/leather_bridle.png": "/assets/images/western_floral_bridle.png",
  "/assets/images/premium_halter.jpg": "/assets/images/western_floral_halter.png",
  "/assets/images/premium_halter.png": "/assets/images/western_floral_halter.png",
  "/assets/images/leather_care.jpg": "/assets/images/saddlera_leather_care.png",
  "/assets/images/leather_care.png": "/assets/images/saddlera_leather_care.png",
};

/** Remap removed or superseded public image paths. */
export function resolvePublicAssetSrc(src: string): string {
  const trimmed = String(src ?? "").trim();
  if (!trimmed) {
    return trimmed;
  }
  const pathOnly = trimmed.split(/[?#]/)[0] ?? trimmed;
  return LEGACY_PUBLIC_ASSETS[pathOnly] ?? trimmed;
}
