/**
 * Public information architecture (1A + 2A).
 * Product grids stay on /collections/*; hubs and rewrites form the public IA.
 */

import { brandName } from "@/constants/brand";

export type NavLinkItem = {
  id: string;
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  label: string;
  links: NavLinkItem[];
};

export type MainNavItem = {
  id: string;
  label: string;
  href: string;
  /** Flat top-level link (no dropdown). */
  children?: never;
  groups?: never;
} | {
  id: string;
  label: string;
  href: string;
  groups: NavGroup[];
  children?: never;
} | {
  id: string;
  label: string;
  href: string;
  children: NavLinkItem[];
  groups?: never;
};

/** Top-level main navigation for desktop + mobile. */
export const MAIN_NAV: MainNavItem[] = [
  {
    id: "navShop",
    label: "Shop",
    href: "/collections/all",
    groups: [
      {
        id: "shop-all",
        label: "Shop All",
        links: [{ id: "shop-all-link", label: "Shop All", href: "/collections/all" }],
      },
      {
        id: "saddles",
        label: "Saddles",
        links: [
          { id: "handcrafted-saddles", label: "Handcrafted Leather Saddles", href: "/collections/engraved-saddles" },
          { id: "western-saddles", label: "Western Saddles", href: "/collections/western-saddles" },
        ],
      },
      {
        id: "saddle-designs",
        label: "Saddle Designs",
        links: [
          { id: "crystal-rhinestone", label: "Crystal & Rhinestone", href: "/collections/crystal-rhinestone" },
          { id: "studded-leather", label: "Studded Leather", href: "/collections/studded-leather" },
        ],
      },
      {
        id: "tack",
        label: "Tack & Accessories",
        links: [
          { id: "bridles", label: "Bridles", href: "/collections/bridles" },
          { id: "breast-collars", label: "Breast Collars", href: "/tack/breast-collars" },
          { id: "reins", label: "Reins", href: "/collections/reins" },
          { id: "saddle-pads", label: "Saddle Pads", href: "/tack/saddle-pads" },
          { id: "matching-sets", label: "Matching Tack Sets", href: "/collections/complete-sets" },
        ],
      },
    ],
  },
  {
    id: "navCustom",
    label: "Custom",
    href: "/custom",
    children: [
      { id: "custom-colors", label: "Custom Colors", href: "/custom/colors" },
      { id: "custom-engraving", label: "Custom Engraving", href: "/custom/engraving" },
      { id: "custom-personalization", label: "Personalized Name & Logo", href: "/custom/personalization" },
      { id: "custom-leather", label: "Custom Leather & Hardware", href: "/custom" },
      { id: "custom-sets", label: "Custom Matching Sets", href: "/collections/complete-sets" },
    ],
  },
  {
    id: "navDisciplines",
    label: "Disciplines",
    href: "/disciplines",
    children: [
      { id: "riding-schools", label: "Riding Schools", href: "/disciplines/riding-schools" },
      { id: "polo", label: "Polo", href: "/disciplines/polo" },
      { id: "tent-pegging", label: "Tent Pegging", href: "/disciplines/tent-pegging" },
      { id: "racing", label: "Racing", href: "/disciplines/racing" },
    ],
  },
  { id: "navBestSellers", label: "Best Sellers", href: "/best-sellers" },
  { id: "navCraftsmanship", label: "Craftsmanship", href: "/craftsmanship" },
  { id: "navAbout", label: "About", href: "/about-us" },
];

/** Flat top-level links for CMS / footer compatibility. */
export const NAV_ITEMS = MAIN_NAV.map((item) => ({
  id: item.id,
  label: item.label,
  path: item.href,
}));

/** Desktop mega-menu featured cards (Voldog-style image grid). */
export type MegaFeaturedCard = {
  id: string;
  label: string;
  href: string;
  /** Lookup key into resolveNavImages / shopCategories / collectionImages. */
  imageKey: string;
};

export type MegaFeaturedSection = {
  navId: string;
  headline: string;
  cards: MegaFeaturedCard[];
};

export const MEGA_FEATURED: Record<string, MegaFeaturedSection> = {
  navShop: {
    navId: "navShop",
    headline: "Handcrafted tack for every ride",
    cards: [
      {
        id: "mega-shop-saddles",
        label: "Handcrafted Saddles",
        href: "/collections/engraved-saddles",
        imageKey: "engraved-saddles",
      },
      {
        id: "mega-shop-tack",
        label: "Tack & Accessories",
        href: "/tack",
        imageKey: "tack-accessories",
      },
      {
        id: "mega-shop-sets",
        label: "Matching Sets",
        href: "/collections/complete-sets",
        imageKey: "complete-sets",
      },
      {
        id: "mega-shop-all",
        label: "Shop All",
        href: "/collections/all",
        imageKey: "all",
      },
    ],
  },
  navCustom: {
    navId: "navCustom",
    headline: "Make it yours — color, engraving, and leather",
    cards: [
      {
        id: "mega-custom-colors",
        label: "Custom Colors",
        href: "/custom/colors",
        imageKey: "crystal-rhinestone",
      },
      {
        id: "mega-custom-engraving",
        label: "Custom Engraving",
        href: "/custom/engraving",
        imageKey: "engraved-saddles",
      },
      {
        id: "mega-custom-personal",
        label: "Personalized Name & Logo",
        href: "/custom/personalization",
        imageKey: "studded-leather",
      },
      {
        id: "mega-custom-sets",
        label: "Custom Matching Sets",
        href: "/collections/complete-sets",
        imageKey: "complete-sets",
      },
    ],
  },
  navDisciplines: {
    navId: "navDisciplines",
    headline: "Built for the way you ride",
    cards: [
      {
        id: "mega-disc-schools",
        label: "Riding Schools",
        href: "/disciplines/riding-schools",
        imageKey: "western-saddles",
      },
      {
        id: "mega-disc-polo",
        label: "Polo",
        href: "/disciplines/polo",
        imageKey: "bridles",
      },
      {
        id: "mega-disc-tent",
        label: "Tent Pegging",
        href: "/disciplines/tent-pegging",
        imageKey: "reins",
      },
      {
        id: "mega-disc-racing",
        label: "Racing",
        href: "/disciplines/racing",
        imageKey: "saddles",
      },
    ],
  },
};

export type HubCta = { label: string; href: string };

export type HubPageContent = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string[];
  links: HubCta[];
  primaryCta?: HubCta;
};

export const HUB_PAGES: Record<string, HubPageContent> = {
  tack: {
    eyebrow: "Tack & Accessories",
    title: "Complete your setup",
    lead: "Bridles, reins, matching sets, and coordinated pieces for the way you ride.",
    body: [
      "Explore available tack collections below. Breast collars and saddle pads are offered through matching sets and custom orders when not listed as standalone collections.",
    ],
    links: [
      { label: "Bridles", href: "/collections/bridles" },
      { label: "Reins", href: "/collections/reins" },
      { label: "Matching Tack Sets", href: "/collections/complete-sets" },
      { label: "Breast Collars", href: "/tack/breast-collars" },
      { label: "Saddle Pads", href: "/tack/saddle-pads" },
    ],
    primaryCta: { label: "Shop All Tack", href: "/collections/all" },
  },
  "tack/breast-collars": {
    eyebrow: "Tack & Accessories",
    title: "Breast Collars",
    lead: "Coordinated breast collars as part of matching tack sets and custom orders.",
    body: [
      "Standalone breast collar collections are not listed separately yet. Many riders choose a Matching Tack Set that pairs a breast collar with bridle, reins, and saddle pad, or request a custom matching piece.",
    ],
    links: [
      { label: "Matching Tack Sets", href: "/collections/complete-sets" },
      { label: "Bridles", href: "/collections/bridles" },
      { label: "Request custom tack", href: "/contact" },
    ],
    primaryCta: { label: "Shop Matching Sets", href: "/collections/complete-sets" },
  },
  "tack/saddle-pads": {
    eyebrow: "Tack & Accessories",
    title: "Saddle Pads",
    lead: "Saddle pads as part of coordinated sets and custom orders.",
    body: [
      "Saddle pads are available through Matching Tack Sets and custom orders. Browse complete sets for coordinated leather pieces, or contact us to discuss a pad that matches your saddle and tack.",
    ],
    links: [
      { label: "Matching Tack Sets", href: "/collections/complete-sets" },
      { label: "Saddles", href: "/collections/saddles" },
      { label: "Contact for custom pad", href: "/contact" },
    ],
    primaryCta: { label: "Shop Matching Sets", href: "/collections/complete-sets" },
  },
  custom: {
    eyebrow: "Custom Your Tack",
    title: "Made for your ride. Made your way.",
    lead: "Choose leather colors, personalization, engraving, and matching sets crafted to your vision.",
    body: [
      `Customization is a capability across ${brandName} products — not a separate catalog of unrelated items. Start with colors or personalization, or contact us for engraving and hardware details.`,
    ],
    links: [
      { label: "Custom Colors", href: "/custom/colors" },
      { label: "Custom Engraving", href: "/custom/engraving" },
      { label: "Personalized Name & Logo", href: "/custom/personalization" },
      { label: "Matching Sets", href: "/collections/complete-sets" },
    ],
    primaryCta: { label: "Create Your Custom Tack", href: "/contact" },
  },
  "custom/engraving": {
    eyebrow: "Custom",
    title: "Custom Engraving",
    lead: "Add personalized leather engraving and detailing.",
    body: [
      "Engraving is available as a custom request on select handcrafted pieces. Tell us what you would like engraved and which product you have in mind — we will confirm feasibility before production.",
    ],
    links: [
      { label: "Handcrafted Leather Saddles", href: "/collections/engraved-saddles" },
      { label: "Personalized Name & Logo", href: "/collections/personalized" },
      { label: "Request engraving", href: "/contact" },
    ],
    primaryCta: { label: "Request Engraving", href: "/contact" },
  },
  disciplines: {
    eyebrow: "Disciplines",
    title: "Crafted for every ride",
    lead: "Purpose-focused tack for riders, schools, and equestrian disciplines.",
    body: [
      `These pages highlight how ${brandName} tack is used across disciplines. They are guides to relevant available products — not separate specialized equipment catalogs.`,
    ],
    links: [
      { label: "Riding Schools", href: "/disciplines/riding-schools" },
      { label: "Polo", href: "/disciplines/polo" },
      { label: "Tent Pegging", href: "/disciplines/tent-pegging" },
      { label: "Racing", href: "/disciplines/racing" },
    ],
    primaryCta: { label: "Shop All", href: "/collections/all" },
  },
  "disciplines/riding-schools": {
    eyebrow: "Disciplines",
    title: "Riding Schools",
    lead: "Durable handcrafted tack for training environments and riding programs.",
    body: [
      "Riding schools need tack that holds up to daily use. Explore saddles, bridles, reins, and matching sets suited to training barns — then contact us for volume or custom color needs.",
    ],
    links: [
      { label: "Saddles", href: "/collections/saddles" },
      { label: "Bridles", href: "/collections/bridles" },
      { label: "Matching Sets", href: "/collections/complete-sets" },
      { label: "Contact for school orders", href: "/contact" },
    ],
    primaryCta: { label: "Shop for Riding Schools", href: "/collections/all" },
  },
  "disciplines/polo": {
    eyebrow: "Disciplines",
    title: "Polo",
    lead: "Tack designed around the demands of fast-paced polo riding.",
    body: [
      `${brandName} does not currently list a dedicated polo-only equipment line. Riders often choose durable saddles, bridles, and reins from our core collections. Contact us if you need help matching tack to polo use.`,
    ],
    links: [
      { label: "Saddles", href: "/collections/saddles" },
      { label: "Bridles", href: "/collections/bridles" },
      { label: "Reins", href: "/collections/reins" },
      { label: "Ask about polo use", href: "/contact" },
    ],
    primaryCta: { label: "Shop Polo-Ready Tack", href: "/collections/all" },
  },
  "disciplines/tent-pegging": {
    eyebrow: "Disciplines",
    title: "Tent Pegging",
    lead: "Specialized tack for traditional tent pegging and competitive riding.",
    body: [
      "We do not currently offer a separate tent pegging product line. Explore Western and handcrafted saddles plus bridles and reins from the main catalog, or contact us to discuss suitability for tent pegging.",
    ],
    links: [
      { label: "Western Saddles", href: "/collections/western-saddles" },
      { label: "Handcrafted Leather Saddles", href: "/collections/engraved-saddles" },
      { label: "Bridles", href: "/collections/bridles" },
      { label: "Contact us", href: "/contact" },
    ],
    primaryCta: { label: "Shop Tent Pegging", href: "/collections/western-saddles" },
  },
  "disciplines/racing": {
    eyebrow: "Disciplines",
    title: "Racing",
    lead: "Purpose-focused equipment for racing environments.",
    body: [
      `${brandName} does not currently sell specialized racing equipment as a dedicated category. Browse core saddles and tack for durable leather options, and contact us with your racing use case so we can point you to appropriate pieces.`,
    ],
    links: [
      { label: "Saddles", href: "/collections/saddles" },
      { label: "Tack & Accessories", href: "/tack" },
      { label: "Contact us", href: "/contact" },
    ],
    primaryCta: { label: "Shop Racing", href: "/collections/all" },
  },
  craftsmanship: {
    eyebrow: "Craftsmanship",
    title: "Handcrafted in Pakistan",
    lead: `Skilled leatherworkers build ${brandName} tack for riders across North America.`,
    body: [
      "Every piece starts with carefully selected leather and is finished by artisans who stitch, tool, and edge with care. We make saddles, bridles, reins, and coordinated sets for riders who want honest materials and lasting gear.",
      "Learn more about the brand story, or shop the collection to feel the craftsmanship yourself.",
    ],
    links: [
      { label: `About ${brandName}`, href: "/about-us" },
      { label: "Shop the collection", href: "/collections/all" },
      { label: `Why ${brandName}`, href: "/#why-saddlera" },
    ],
    primaryCta: { label: "Explore Craftsmanship", href: "/about-us" },
  },
  "size-guide": {
    eyebrow: "Fit",
    title: "Not sure what size you need?",
    lead: "Find the right saddle and tack size with our fit guide.",
    body: [
      `Detailed sizing charts will be published here as we expand fit guidance. Until then, we recommend working with a professional saddle fitter for first adjustments, and contacting ${brandName} with your horse’s measurements and the product you have in mind.`,
    ],
    links: [
      { label: "Saddle fit FAQ", href: "/faq" },
      { label: "Contact for fit help", href: "/contact" },
      { label: "Browse saddles", href: "/collections/saddles" },
    ],
    primaryCta: { label: "Contact for Fit Help", href: "/contact" },
  },
};

export function getHubPage(slug: string): HubPageContent | null {
  return HUB_PAGES[slug] ?? null;
}
