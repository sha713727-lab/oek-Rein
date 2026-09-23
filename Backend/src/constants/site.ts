import { brandName } from "@/constants/brand";

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

export const NAV_ITEMS = [
  { id: "navNew", label: "New Arrivals", path: "/collections/new" },
  { id: "navAll", label: "Shop All", path: "/collections/all" },
  { id: "navSaddles", label: "Saddles", path: "/collections/saddles" },
  { id: "navBridles", label: "Bridles", path: "/collections/bridles" },
  { id: "navReins", label: "Reins", path: "/collections/reins" },
  { id: "navCare", label: "Leather Care", path: "/collections/care" },
] as const;

export const SHOP_RANGE_EYEBROW = "Explore our range";
export const SHOP_RANGE_TITLE = "Shop by Category";
export const SHOP_RANGE_SUPPORT =
  "Premium handcrafted Pakistani leather products — saddles, bridles, reins, and more made for North American riders.";
export const SHOP_RANGE_SIGNATURE = "Crafted in Pakistan. Shipped to North America.";

export const SHOP_RANGE_CATEGORIES = [
  {
    id: "engraved-saddles",
    title: "Hand Crafted Leather Engraved Saddles",
    description: "A master leather craftsman designs our unique and one-of-a-kind leather saddles.",
    href: "/collections/engraved-saddles",
    image: "/assets/images/western_floral_saddle.png",
    alt: `${brandName} hand crafted leather engraved saddle`,
    tone: "blush",
    icon: "saddle",
  },
  {
    id: "western-saddles",
    title: "Western Saddles",
    description: "Elegant, durable saddles made from the finest quality Pakistani leather.",
    href: "/collections/western-saddles",
    image: "/assets/images/premium_saddle.png",
    alt: `${brandName} western saddle`,
    tone: "mint",
    icon: "saddle",
  },
  {
    id: "crystal-rhinestone",
    title: "Crystal - Rhinestone",
    description: "Beautifully designed pieces for everyday rides and the show ring.",
    href: "/collections/crystal-rhinestone",
    image: "/assets/images/western_floral_bridle.png",
    alt: `${brandName} crystal rhinestone bridle`,
    tone: "blush",
    icon: "bridle",
  },
  {
    id: "studded-leather",
    title: "Studded Leather",
    description: "Premium studded leather made for lasting beauty and classic longevity.",
    href: "/collections/studded-leather",
    image: "/assets/images/leather_bridle.png",
    alt: `${brandName} studded leather bridle`,
    tone: "blush",
    icon: "bridle",
  },
  {
    id: "custom-colors",
    title: "Custom Colors",
    description: "Choose custom colorways to match your horse, barn, and personal style.",
    href: "/collections/custom-colors",
    image: "/assets/images/western_floral_halter.png",
    alt: `${brandName} custom color leather`,
    tone: "mint",
    icon: "leather",
  },
  {
    id: "personalized",
    title: "Personalized Name/Logo",
    description: "Add your name or logo for one-of-a-kind saddles and tack.",
    href: "/collections/personalized",
    image: "/assets/images/saddle_hero.jpg",
    alt: `${brandName} personalized leather`,
    tone: "blush",
    icon: "stitch",
  },
  {
    id: "complete-sets",
    title: "Matching Bridle, Breast Collar, Reins & Saddle Pad — Complete Set",
    description: "Coordinated matching sets — bridle, breast collar, reins, and saddle pad.",
    href: "/collections/complete-sets",
    image: "/assets/images/western_floral_new_arrivals.png",
    alt: `${brandName} matching complete set`,
    tone: "blush",
    icon: "horseshoe",
  },
] as const;

export const SHOP_RANGE_TRUST = [
  { id: "natural", title: "Pakistani Leather", detail: "Premium Full-Grain", icon: "leather" },
  { id: "cruelty", title: "Handcrafted", detail: "Artisan Made", icon: "stitch" },
  { id: "tested", title: "Built to Ride", detail: "Trail to Arena", icon: "shield" },
  { id: "sustain", title: "For North America", detail: "US & Canada Ready", icon: "horse" },
] as const;

export const BEST_SELLERS_CTA = "View All Products";
export const BEST_SELLERS_CTA_HREF = "/collections/all";
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
    id: "saddle-fit",
    question: `How do I know the saddle will fit my horse?`,
    answer:
      `${brandName} saddles are handcrafted with fit-minded construction for North American riding. We recommend working with a professional saddle fitter for first adjustments on your horse.`,
  },
  {
    id: "leather-care",
    question: `How should I care for my ${brandName} leather goods?`,
    answer:
      "Pakistani leather loves routine care. Use our leather balm every few weeks, store tack dry and cool, and wipe sweat and dirt after each ride.",
  },
  {
    id: "shipping-na",
    question: "Do you ship to North America?",
    answer:
      `Yes. ${brandName} is made in Pakistan and ships to riders across the United States and Canada. Tracking details arrive after your order is confirmed.`,
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
    links: NAV_ITEMS.map((item) => ({ label: item.label, href: item.path })),
  },
  {
    id: "house",
    title: "House",
    links: [
      { label: "About", href: "/about-us" },
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
