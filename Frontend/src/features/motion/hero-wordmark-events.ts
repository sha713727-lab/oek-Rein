export const HERO_COMPACT_EVENT = "oakrein:hero-compact";
export const HERO_INTRO_EVENT = "oakrein:hero-intro";
export const HERO_WORDMARK_SESSION_KEY = "oakrein:hero-wordmark:v1:seen";

export const HERO_DESKTOP_MQ =
  "(min-width: 1024px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export const HERO_DESKTOP_LAYOUT_MQ = "(min-width: 1024px) and (min-height: 600px) and (pointer: fine)";

export const HERO_COMPACT_MQ = [
  "(prefers-reduced-motion: no-preference) and (max-width: 1023px)",
  "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (max-height: 599px)",
  "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 600px) and (pointer: coarse)",
].join(", ");

export type HeroCompactDetail = {
  compact: boolean;
};

export type HeroIntroDetail = {
  active: boolean;
};

export function readHeroSessionSeen(): boolean {
  try {
    return sessionStorage.getItem(HERO_WORDMARK_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeHeroSessionSeen(): void {
  try {
    sessionStorage.setItem(HERO_WORDMARK_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

let lastCompact: boolean | null = null;

export function readHeroCompact(): boolean | null {
  return lastCompact;
}

export function notifyHeroCompact(compact: boolean): void {
  if (lastCompact === compact) {
    return;
  }
  lastCompact = compact;
  window.dispatchEvent(new CustomEvent<HeroCompactDetail>(HERO_COMPACT_EVENT, { detail: { compact } }));
}

export function notifyHeroIntro(active: boolean): void {
  window.dispatchEvent(new CustomEvent<HeroIntroDetail>(HERO_INTRO_EVENT, { detail: { active } }));
}

export function isHeroDesktopLayout(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(HERO_DESKTOP_LAYOUT_MQ).matches;
}
