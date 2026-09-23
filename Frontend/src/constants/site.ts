import { brandName } from "@/constants/brand";
import { NAV_ITEMS as MAIN_NAV_FLAT } from "@/constants/navigation-ia";

export type { HubPageContent, MainNavItem, NavGroup, NavLinkItem } from "@/constants/navigation-ia";
export { getHubPage, HUB_PAGES, MAIN_NAV, NAV_ITEMS } from "@/constants/navigation-ia";

/** @deprecated Prefer MAIN_NAV; alias of NAV_ITEMS from navigation-ia. */
export const NAV_ITEMS_FLAT = MAIN_NAV_FLAT;

export const LOCALES = ["en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORT_EMAIL = "support@oakrein.com";
/** Display form for customers */
export const SUPPORT_PHONE = "0311 700 3196";
/** Local Pakistan mobile (no spaces) */
export const SUPPORT_PHONE_LOCAL = "03117003196";
/** E.164 for tel: links and WhatsApp */
export const SUPPORT_PHONE_E164 = "+923117003196";
export const SUPPORT_PHONE_DIGITS = "923117003196";
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE_DIGITS}`;
export const SUPPORT_ADDRESS = "12 Gulberg III, Lahore, Pakistan 54000";

export function supportWhatsAppUrl(prefill?: string): string {
  if (!prefill?.trim()) {
    return SUPPORT_WHATSAPP_URL;
  }
  return `${SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent(prefill.trim())}`;
}

/** Normalize PK / international phones to WhatsApp digits (country code, no +). */
export function toWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }
  if (digits.startsWith("92") && digits.length >= 12) {
    return digits.slice(0, 12);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("3")) {
    return `92${digits}`;
  }
  return digits;
}

export function resolveSupportPhoneDigits(phone?: string | null): string {
  return toWhatsAppDigits(phone ?? "") ?? SUPPORT_PHONE_DIGITS;
}

export function formatSupportPhoneDisplay(phone?: string | null): string {
  const digits = resolveSupportPhoneDigits(phone);
  if (digits.startsWith("92") && digits.length === 12) {
    const local = `0${digits.slice(2)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  const trimmed = String(phone ?? "").trim();
  return trimmed || SUPPORT_PHONE;
}

export function supportPhoneE164(phone?: string | null): string {
  return `+${resolveSupportPhoneDigits(phone)}`;
}

export function supportWhatsAppUrlFromPhone(phone?: string | null, prefill?: string): string {
  const base = `https://wa.me/${resolveSupportPhoneDigits(phone)}`;
  if (!prefill?.trim()) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(prefill.trim())}`;
}

export const SHOP_RANGE_EYEBROW = "Find your perfect tack";
export const SHOP_RANGE_TITLE = "Find your perfect tack";
export const SHOP_RANGE_SUPPORT =
  "Handcrafted leather, distinctive designs and custom details — made for the way you ride.";
export const SHOP_RANGE_SIGNATURE = "Crafted in Pakistan. Shipped to North America.";

export const SHOP_RANGE_CATEGORIES = [
  {
    id: "engraved-saddles",
    title: "Handcrafted Saddles",
    description: "Traditional leather craftsmanship, made for the modern rider.",
    href: "/collections/engraved-saddles",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} handcrafted leather saddle`,
    tone: "blush",
    icon: "saddle",
    cta: "Shop Saddles",
  },
  {
    id: "western-saddles",
    title: "Western Saddles",
    description: "Authentic western styling with handcrafted leather detailing.",
    href: "/collections/western-saddles",
    image: "/assets/images/premium_saddle.png",
    alt: `${brandName} western saddle`,
    tone: "mint",
    icon: "saddle",
    cta: "Shop Western",
  },
  {
    id: "crystal-rhinestone",
    title: "Crystal & Rhinestone",
    description: "Make your ride stand out with premium crystal and rhinestone detailing.",
    href: "/collections/crystal-rhinestone",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} crystal rhinestone tack`,
    tone: "blush",
    icon: "bridle",
    cta: "Explore Designs",
  },
  {
    id: "studded-leather",
    title: "Studded Leather",
    description: "Bold leatherwork with distinctive studded detailing.",
    href: "/collections/studded-leather",
    image: "/assets/images/leather_bridle.png",
    alt: `${brandName} studded leather`,
    tone: "blush",
    icon: "bridle",
    cta: "Explore Studded",
  },
  {
    id: "tack-accessories",
    title: "Tack & Accessories",
    description: "Bridles, breast collars, reins and saddle pads.",
    href: "/tack",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} tack and accessories`,
    tone: "mint",
    icon: "bridle",
    cta: "Shop Tack",
  },
  {
    id: "complete-sets",
    title: "Matching Sets",
    description: "Complete your setup with coordinated leather tack.",
    href: "/collections/complete-sets",
    image: "/assets/images/western_floral_new_arrivals.png",
    alt: `${brandName} matching tack sets`,
    tone: "blush",
    icon: "horseshoe",
    cta: "Shop Sets",
  },
] as const;

export const SHOP_RANGE_TRUST = [
  { id: "natural", title: "Handcrafted Leather", detail: "Crafted by skilled leatherworkers.", icon: "leather" },
  { id: "cruelty", title: "Custom Options", detail: "Colors, personalization and matching sets.", icon: "stitch" },
  { id: "tested", title: "Secure Checkout", detail: "Protected payment experience.", icon: "shield" },
  { id: "sustain", title: "North America Shipping", detail: "Shipping options across the US and Canada.", icon: "horse" },
] as const;

export const BEST_SELLERS_CTA = "View Best Sellers";
export const BEST_SELLERS_CTA_HREF = "/best-sellers";
export const BEST_SELLERS_VIEW = "View Product";

export const BEST_SELLERS = [
  {
    id: "saddle-pro",
    title: "Western Floral Saddle",
    description: "Hand-tooled Pakistani chestnut leather with silver conchos — comfort and show-ready presence for North America.",
    price: 450000,
    href: "/collections/saddles",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} Western Floral Saddle`,
    tone: "blush",
    sku: "ZM-SAD-001",
    category: "saddles",
    keywords: ["saddle", "western", "floral"],
  },
  {
    id: "bridle-elite",
    title: "Western Floral Bridle",
    description: "Tooled Pakistani leather with silver floral concho and matching coiled reins.",
    price: 85000,
    href: "/collections/bridles",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} Western Floral Bridle`,
    tone: "mint",
    sku: "ZM-BRI-001",
    category: "bridles",
    keywords: ["bridle", "western", "floral"],
  },
  {
    id: "hourse-shoe",
    title: "Hourse Shoe",
    description: "Precision steel horseshoes with matching nails — stamped and ready for the forge.",
    price: 12000,
    href: "/collections/new",
    image: "/assets/images/hourse_shoe.png",
    alt: `${brandName} Hourse Shoe`,
    tone: "blush",
    sku: "ZM-SHO-001",
    category: "new-arrivals",
    keywords: ["horseshoe", "hourse shoe", "shoe", "nails"],
  },
] as const;

export const PRODUCT_HIGHLIGHTS_TITLE = `${brandName} Product`;
export const PRODUCT_HIGHLIGHTS_MARK = "Highlights";
export const PRODUCT_HIGHLIGHTS_IMAGE = "/assets/images/western_floral_saddle.png";
export const PRODUCT_HIGHLIGHTS_ALT = `${brandName} western floral saddle`;

export const PRODUCT_HIGHLIGHTS = [
  {
    id: "hydrating",
    corner: "tl",
    title: "Pakistani Leather",
    description: "Full-grain leather finished in Pakistan for strength and a rich hand.",
    icon: "leather",
  },
  {
    id: "cruelty",
    corner: "tr",
    title: "Artisan Crafted",
    description: "Hand-stitched by master saddlers — seams and edges finished with care.",
    icon: "stitch",
  },
  {
    id: "aging",
    corner: "bl",
    title: "Balanced Design",
    description: "Built for rider and horse comfort from cinch to cool-down.",
    icon: "balance",
  },
  {
    id: "soothing",
    corner: "br",
    title: "Made for North America",
    description: "Style and durability for barns, trails, and arenas across the US and Canada.",
    icon: "horse",
  },
] as const;

export const GLOW_STATS_TITLE = "Handcrafted in Pakistan. Trusted in North America.";
export const GLOW_STATS_COPY =
  "Premium leather, meticulous stitching, and tack that arrives ready for real North American rides.";
export const GLOW_STATS_CTA = "Shop now";
export const GLOW_STATS_CTA_HREF = "/collections/all";
export const GLOW_STATS_IMAGE = "/assets/images/saddle_hero.jpg";
export const GLOW_STATS_ALT = `${brandName} premium gear for your horse`;

export const HOME_TESTIMONIALS_BADGE = "Customer reviews";
export const HOME_TESTIMONIALS_HEADLINE = "Leather that rides as good as it looks";
export const HOME_TESTIMONIALS_RIBBON = "Crafted in Pakistan. Loved in North America.";
export const HOME_TESTIMONIALS_RATING = 4.9;
export const HOME_TESTIMONIALS_COUNT = 152;

export const HOME_TESTIMONIALS = [
  {
    id: "sara",
    name: "Emily Carter",
    when: "2 months ago",
    rating: 5,
    initials: "EC",
    tone: "#a8c5c1",
    body: "Ordered from Texas — the Western Floral saddle arrived beautifully packed. The Pakistani leather feels substantial and broke in beautifully.",
  },
  {
    id: "hira",
    name: "Jordan Blake",
    when: "3 months ago",
    rating: 5,
    initials: "JB",
    tone: "#859361",
    body: "Bought the floral bridle for my mare in Ontario. Soft padding, clean stitching, and it looks sharp in the show ring.",
  },
  {
    id: "aisha",
    name: "Maya Lopez",
    when: "5 months ago",
    rating: 5,
    initials: "ML",
    tone: "#c8cc2e",
    body: "Finally found handcrafted Pakistani leather that holds up on California trails. The halter is tough and still elegant.",
  },
  {
    id: "noor",
    name: "Chris Nguyen",
    when: "1 month ago",
    rating: 5,
    initials: "CN",
    tone: "#d0d5d2",
    body: "Shipped to Alberta without drama. Saddle and leather care kit feel premium — real craftsmanship, not mass-market tack.",
  },
  {
    id: "maha",
    name: "Hannah Brooks",
    when: "4 months ago",
    rating: 4,
    initials: "HB",
    tone: "#e1e53f",
    body: `The leather balm revived my older bridle. Love that ${brandName} is artisan-made in Pakistan for riders here in the US.`,
  },
] as const;

export const FEATURES = [
  {
    title: "Pakistani Craft",
    description: "Hand-stitched tack from master leather artisans",
    icon: "stitch",
  },
  {
    title: "Premium Leather",
    description: "Full-grain leather chosen for strength and feel",
    icon: "leather",
  },
  {
    title: "Secure Shopping",
    description: "Safe checkout for US and Canadian orders",
    icon: "shield",
  },
  {
    title: "Ships to North America",
    description: "Reliable delivery across the US and Canada",
    icon: "truck",
  },
] as const;

export const HOME_FAQ_TITLE_BEFORE = "Your";
export const HOME_FAQ_TITLE_AFTER = "Questions, Answered";
export const HOME_FAQ_IMAGE = "/assets/images/saddlera_leather_care.png";
export const HOME_FAQ_IMAGE_ALT = `${brandName} leather care kit`;

export const HOME_FAQ = [
  {
    id: "leather",
    question: "What leather is used?",
    answer:
      `${brandName} uses full-grain Pakistani leather selected for strength and a rich hand. Care for it with routine cleaning and leather balm.`,
  },
  {
    id: "handcrafted",
    question: "Are products handcrafted?",
    answer:
      "Yes. Pieces are handcrafted in Pakistan by skilled leatherworkers — stitched, tooled, and finished with care.",
  },
  {
    id: "custom-colors",
    question: "Can I customize colors?",
    answer:
      "Custom colorways are available on select pieces. Browse the Custom Colors collection or contact us to discuss options for your order.",
  },
  {
    id: "name-logo",
    question: "Can I add a name or logo?",
    answer:
      "Yes. Personalized name and logo options are available on select products. See Personalized pieces or contact us with your artwork.",
  },
  {
    id: "engraving",
    question: "Can I request engraving?",
    answer:
      "Engraving is offered as a custom request on select handcrafted pieces. Contact us with the product and text or design you have in mind so we can confirm before production.",
  },
  {
    id: "matching-sets",
    question: "Can I order matching tack?",
    answer:
      "Yes. Matching Tack Sets coordinate pieces such as bridle, breast collar, reins, and saddle pad where available. You can also request custom matching combinations.",
  },
  {
    id: "saddle-fit",
    question: "How do I choose the right saddle size?",
    answer:
      "We recommend working with a professional saddle fitter for first adjustments. Visit our Size Guide for an overview, or contact us with your horse’s measurements and the saddle you are considering.",
  },
  {
    id: "shipping-na",
    question: "Where do you ship?",
    answer:
      "Orders ship from Pakistan to addresses across the United States and Canada. Tracking details arrive after your order is confirmed.",
  },
  {
    id: "shipping-times",
    question: "What are the shipping times?",
    answer:
      "Transit times vary by destination and carrier. You will receive an order reference after checkout so you can follow up with client care if needed. Free shipping may apply above the published order threshold shown at checkout.",
  },
  {
    id: "returns",
    question: "What is the return or exchange policy?",
    answer:
      "Unused saddles, bridles, and tack may be exchanged within 14 days of delivery. Used, fitted, or leather-conditioned items cannot be returned. Contact us with your order reference before sending anything back.",
  },
  {
    id: "contact",
    question: `How can I contact ${brandName}?`,
    answer:
      "Reach us through the Contact page for questions about orders, fit, customization, or shipping to the US and Canada. Guest orders can also be looked up at Order Lookup with your email and order number.",
  },
  {
    id: "tracking",
    question: "How do I track my order?",
    answer:
      "After checkout, look up a guest order at /orders/lookup with your email and order number. Signed-in members can also follow status under Account, Orders.",
  },
] as const;

export const FOOTER_SOCIAL = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com/saddlera", icon: "facebook" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/saddlera", icon: "instagram" },
  { id: "pinterest", label: "Pinterest", href: "https://pinterest.com/saddlera", icon: "pinterest" },
] as const;

export const FOOTER_NAV = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { label: "Shop All", href: "/collections/all" },
      { label: "Saddles", href: "/collections/saddles" },
      { label: "Tack & Accessories", href: "/tack" },
      { label: "Matching Sets", href: "/collections/complete-sets" },
      { label: "Best Sellers", href: "/best-sellers" },
    ],
  },
  {
    id: "house",
    title: "House",
    links: [
      { label: "About", href: "/about-us" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "Custom", href: "/custom" },
      { label: "Disciplines", href: "/disciplines" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Track order", href: "/orders/lookup" },
    ],
  },
  {
    id: "policies",
    title: "Policies",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
] as const;

export const COLLECTION_HEROES: Record<
  string,
  { first: string; second: string; image: string; alt: string; tone: "mint" | "blush" | "olive" }
> = {
  all: {
    first: "The",
    second: "Collection",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} western floral saddle`,
    tone: "mint",
  },
  new: {
    first: "New",
    second: "Arrivals",
    image: "/assets/images/western_floral_new_arrivals.png",
    alt: `${brandName} western floral new arrivals`,
    tone: "olive",
  },
  saddles: {
    first: "Premium",
    second: "Saddles",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} western floral saddle`,
    tone: "olive",
  },
  bridles: {
    first: "Elegant",
    second: "Bridles",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} western floral bridle`,
    tone: "olive",
  },
  halters: {
    first: "Classic",
    second: "Reins",
    image: "/assets/images/western_floral_halter.png",
    alt: `${brandName} reins and headstalls`,
    tone: "mint",
  },
  reins: {
    first: "Classic",
    second: "Reins",
    image: "/assets/images/western_floral_halter.png",
    alt: `${brandName} reins and headstalls`,
    tone: "mint",
  },
  care: {
    first: "Leather",
    second: "Care",
    image: "/assets/images/saddlera_leather_care.png",
    alt: `${brandName} leather care kit`,
    tone: "olive",
  },
  "engraved-saddles": {
    first: "Engraved",
    second: "Saddles",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} hand crafted leather engraved saddle`,
    tone: "olive",
  },
  "western-saddles": {
    first: "Western",
    second: "Saddles",
    image: "/assets/images/premium_saddle.png",
    alt: `${brandName} western saddle`,
    tone: "olive",
  },
  "crystal-rhinestone": {
    first: "Crystal",
    second: "Rhinestone",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} crystal rhinestone bridle`,
    tone: "mint",
  },
  "studded-leather": {
    first: "Studded",
    second: "Leather",
    image: "/assets/images/leather_bridle.png",
    alt: `${brandName} studded leather`,
    tone: "olive",
  },
  "custom-colors": {
    first: "Custom",
    second: "Colors",
    image: "/assets/images/western_floral_halter.png",
    alt: `${brandName} custom color leather`,
    tone: "mint",
  },
  personalized: {
    first: "Personalized",
    second: "Leather",
    image: "/assets/images/saddle_hero.jpg",
    alt: `${brandName} personalized leather`,
    tone: "olive",
  },
  "complete-sets": {
    first: "Complete",
    second: "Sets",
    image: "/assets/images/western_floral_new_arrivals.png",
    alt: `${brandName} matching complete set`,
    tone: "olive",
  },
};

export const RITUAL_FEATURE_TITLE = "Gear Made For";
export const RITUAL_FEATURE_MARK = "Riders";

export type RitualIcon =
  | "leather"
  | "horse"
  | "saddle"
  | "stitch"
  | "bridle"
  | "halter"
  | "horseshoe"
  | "balance"
  | "shield";

export const RITUAL_FEATURE_NOTES = [
  {
    id: "pure",
    title: "Pakistani Leather",
    description: "Premium full-grain leather handcrafted for daily comfort and lasting durability.",
    icon: "leather",
  },
  {
    id: "simple",
    title: "North America Ready",
    description: "Equestrian gear shaped for barns, trails, and arenas across the US and Canada.",
    icon: "horse",
  },
] as const;

export const COLLECTION_RITUALS: Record<
  string,
  {
    title: string;
    mark: string;
    notes: readonly [{ title: string; description: string; icon: RitualIcon }, { title: string; description: string; icon: RitualIcon }];
  }
> = {
  all: {
    title: RITUAL_FEATURE_TITLE,
    mark: RITUAL_FEATURE_MARK,
    notes: RITUAL_FEATURE_NOTES,
  },
  new: {
    title: "Fresh Gear For",
    mark: "Now",
    notes: [
      {
        title: "New Additions",
        description: "Fresh handcrafted pieces for North American barns and trails.",
        icon: "horseshoe",
      },
      {
        title: "Daily Comfort",
        description: "Pakistani leather gear made to feel right from the first ride.",
        icon: "leather",
      },
    ],
  },
  saddles: {
    title: "Saddles Made For",
    mark: "Balance",
    notes: [
      {
        title: "Targeted Comfort",
        description: "Engineered to keep both horse and rider comfortable all day.",
        icon: "saddle",
      },
      {
        title: "Master Craft",
        description: "Hand-stitched in Pakistan with detail that shows in every ride.",
        icon: "stitch",
      },
    ],
  },
  bridles: {
    title: "Bridles For",
    mark: "Control",
    notes: [
      {
        title: "Soft Padding",
        description: "Nourishing padded leather to ensure comfort for your horse.",
        icon: "bridle",
      },
      {
        title: "Elegant Finish",
        description: "Classic styling for a perfect look in the arena.",
        icon: "leather",
      },
    ],
  },
  halters: {
    title: "Reins Made For",
    mark: "Feel",
    notes: [
      {
        title: "Secure Hands",
        description: "Balanced reins that feel soft and confident in hand.",
        icon: "halter",
      },
      {
        title: "Durable Hardware",
        description: "Brass and stainless steel fittings built to last.",
        icon: "shield",
      },
    ],
  },
  reins: {
    title: "Reins Made For",
    mark: "Feel",
    notes: [
      {
        title: "Secure Hands",
        description: "Balanced reins that feel soft and confident in hand.",
        icon: "halter",
      },
      {
        title: "Durable Hardware",
        description: "Brass and stainless steel fittings built to last.",
        icon: "shield",
      },
    ],
  },
  care: {
    title: "Care Beyond",
    mark: "Riding",
    notes: [
      {
        title: "Nourishing Balm",
        description: "Keep your leather soft and protected from the elements.",
        icon: "leather",
      },
      {
        title: "Soft Brushes",
        description: "Gently remove dirt without scratching your premium gear.",
        icon: "stitch",
      },
    ],
  },
  "engraved-saddles": {
    title: "Engraved For",
    mark: "Show",
    notes: [
      { title: "Hand Tooling", description: "One-of-a-kind engraved leather shaped by master craftsmen.", icon: "saddle" },
      { title: "Artisan Detail", description: "Deep floral and geometric tooling that lasts for years.", icon: "stitch" },
    ],
  },
  "western-saddles": {
    title: "Western Saddles For",
    mark: "Trails",
    notes: [
      { title: "Trail Ready", description: "Balanced western seats built for long rides and real work.", icon: "saddle" },
      { title: "Premium Leather", description: "Full-grain Pakistani leather with lasting structure.", icon: "leather" },
    ],
  },
  "crystal-rhinestone": {
    title: "Crystal Pieces For",
    mark: "Sparkle",
    notes: [
      { title: "Show Shine", description: "Rhinestone accents that catch the light in the ring.", icon: "bridle" },
      { title: "Daily Softness", description: "Still comfortable enough for everyday schooling.", icon: "leather" },
    ],
  },
  "studded-leather": {
    title: "Studded Leather For",
    mark: "Presence",
    notes: [
      { title: "Bold Hardware", description: "Studded finishes with classic western character.", icon: "bridle" },
      { title: "Built to Last", description: "Premium leather and fittings for long-term wear.", icon: "shield" },
    ],
  },
  "custom-colors": {
    title: "Custom Colors For",
    mark: "You",
    notes: [
      { title: "Your Palette", description: "Colorways that match barn colors, brands, and personal style.", icon: "leather" },
      { title: "Same Craft", description: "Custom color, same Pakistani leather quality.", icon: "stitch" },
    ],
  },
  personalized: {
    title: "Personalized For",
    mark: "Identity",
    notes: [
      { title: "Name and Logo", description: "Stamp your name or mark into premium leather.", icon: "stitch" },
      { title: "One of One", description: "Made-to-order details that belong only to you.", icon: "saddle" },
    ],
  },
  "complete-sets": {
    title: "Complete Sets For",
    mark: "Match",
    notes: [
      { title: "Full Match", description: "Bridle, breast collar, reins, and pad designed to go together.", icon: "horseshoe" },
      { title: "Ready to Ride", description: "Coordinated leather sets without mixing mismatched pieces.", icon: "leather" },
    ],
  },

};

export const AUTH_BANNERS = {
  login: { src: "/assets/images/western_floral_saddle.png", alt: `${brandName} western floral saddle` },
  register: { src: "/assets/images/western_floral_bridle.png", alt: `${brandName} western floral bridle` },
  adminLogin: { src: "/assets/images/western_floral_halter.png", alt: `${brandName} western floral halter` },
} as const;

export const INFO_STILLS = {
  about: { src: "/assets/images/saddle_hero.jpg", alt: `${brandName} saddle hero` },
  contact: { src: "/assets/images/saddlera_leather_care.png", alt: `${brandName} leather care kit` },
} as const;
