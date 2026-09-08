import { brandName } from "@/constants/brand";

export const LOCALES = ["en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORT_EMAIL = "support@zermae.com";
export const SUPPORT_PHONE = "+92 300 123 4567";
export const SUPPORT_ADDRESS = "12 Gulberg III, Lahore, Pakistan 54000";

export const NAV_ITEMS = [
  { id: "navNew", label: "New Arrivals", path: "/collections/new" },
  { id: "navAll", label: "Shop All", path: "/collections/all" },
  { id: "navSerums", label: "Serums", path: "/collections/serums" },
  { id: "navCreams", label: "Creams", path: "/collections/creams" },
  { id: "navCleansers", label: "Cleansers", path: "/collections/cleansers" },
  { id: "navBody", label: "Body Care", path: "/collections/body" },
] as const;

export const SHOP_RANGE_EYEBROW = "Explore our range";
export const SHOP_RANGE_TITLE = "Shop by Category";
export const SHOP_RANGE_SUPPORT =
  "Discover skincare essentials, crafted with natural ingredients to nourish your skin and elevate your glow.";
export const SHOP_RANGE_SIGNATURE = "Pure. Natural. Zermae.";

export const SHOP_RANGE_CATEGORIES = [
  {
    id: "creams",
    title: "Creams",
    description: "Deep hydration and lasting nourishment for soft, healthy skin.",
    href: "/collections/creams",
    image: "/assets/images/aminoAcidGelCleanser.png",
    alt: `${brandName} Lumie night cream`,
    tone: "blush",
    icon: "flower",
  },
  {
    id: "cleansers",
    title: "Cleansers",
    description: "A gentle daily cleanse that leaves skin calm, fresh and comfortable.",
    href: "/collections/cleansers",
    image: "/assets/images/pdrnSerum.png",
    alt: `${brandName} amino acid gel cleanser`,
    tone: "mint",
    icon: "drop",
  },
  {
    id: "serums",
    title: "Serums",
    description: "Targeted care in a few considered drops for a clearer, brighter look.",
    href: "/collections/serums",
    image: "/assets/images/lumieNightCream.png",
    alt: `${brandName} vitamin C radiance serum`,
    tone: "blush",
    icon: "dropper",
  },
  {
    id: "body",
    title: "Body Care",
    description: "Nourishing textures for skin beyond the face, made for real routines.",
    href: "/collections/body",
    image: "/assets/images/cocoVelvetBodyPolish.png",
    alt: `${brandName} Coco Velvet body polish`,
    tone: "mint",
    icon: "leaf",
  },
  {
    id: "new",
    title: "New Arrivals",
    description: "Fresh formulas to begin or refine your Zermae ritual.",
    href: "/collections/new",
    image: "/assets/images/clgnCollagenPeelOffMask.png",
    alt: `${brandName} collagen peel-off mask`,
    tone: "blush",
    icon: "sparkle",
  },
] as const;

export const SHOP_RANGE_TRUST = [
  { id: "natural", title: "Natural Ingredients", detail: "Botanical & Pure", icon: "leaf" },
  { id: "cruelty", title: "Cruelty Free", detail: "Kind to Animals", icon: "rabbit" },
  { id: "tested", title: "Clinically Tested", detail: "Safe & Effective", icon: "flask" },
  { id: "sustain", title: "Sustainable", detail: "Eco-Conscious", icon: "heart" },
] as const;

export const BEST_SELLERS_CTA = "View All Products";
export const BEST_SELLERS_CTA_HREF = "/collections/all";
export const BEST_SELLERS_VIEW = "View Product";

export const BEST_SELLERS = [
  {
    id: "vitaminC",
    title: "Vitamin C Radiance Serum",
    description: "A daily drop to brighten, even tone and keep skin looking fresh.",
    price: 7800,
    href: "/collections/serums",
    image: "/assets/images/lumieNightCream.png",
    alt: `${brandName} vitamin C radiance serum`,
    tone: "blush",
    sku: "ZM-VITC-001",
    category: "serums",
    keywords: ["vitamin c", "radiance"],
  },
  {
    id: "pdrn",
    title: "PDRN Serum",
    description: "Skin renewal care for a firmer, more rested-looking complexion.",
    price: 8200,
    href: "/collections/serums",
    image: "/assets/images/vitaminCRadianceSerum.png",
    alt: `${brandName} PDRN serum`,
    tone: "mint",
    sku: "ZM-PDRN-001",
    category: "serums",
    keywords: ["pdrn"],
  },
  {
    id: "lumie",
    title: "Lumie Night Cream",
    description: "Comforting overnight cream that restores softness while you rest.",
    price: 6200,
    href: "/collections/creams",
    image: "/assets/images/aminoAcidGelCleanser.png",
    alt: `${brandName} Lumie night cream`,
    tone: "blush",
    sku: "ZM-LUMIE-001",
    category: "creams",
    keywords: ["lumie", "night cream"],
  },
] as const;

export const PRODUCT_HIGHLIGHTS_TITLE = "Zermae Product";
export const PRODUCT_HIGHLIGHTS_MARK = "Highlights";
export const PRODUCT_HIGHLIGHTS_IMAGE = "/assets/images/pdrnSerum.png";
export const PRODUCT_HIGHLIGHTS_ALT = `${brandName} amino acid gel cleanser`;

export const PRODUCT_HIGHLIGHTS = [
  {
    id: "hydrating",
    corner: "tl",
    title: "Hydrating",
    description: "Keeps skin comfortable and moisturized through the day, for a fresh, dewy-looking finish.",
    icon: "drop",
  },
  {
    id: "cruelty",
    corner: "tr",
    title: "Cruelty Free",
    description: "Formulas made without animal testing, so every ritual stays kind from lab to skin.",
    icon: "rabbit",
  },
  {
    id: "aging",
    corner: "bl",
    title: "Anti-Aging",
    description: "Botanical care for a firmer, more rested-looking complexion as part of a daily routine.",
    icon: "glow",
  },
  {
    id: "soothing",
    corner: "br",
    title: "Soothing",
    description: "A calm, gentle texture that leaves skin feeling soft, balanced and at ease.",
    icon: "flower",
  },
] as const;

export const GLOW_STATS_TITLE = "Glow Around the World";
export const GLOW_STATS_COPY =
  "A growing community choosing considered skincare — honest formulas, calm routines, and a glow that travels.";
export const GLOW_STATS_CTA = "Shop Now";
export const GLOW_STATS_CTA_HREF = "/collections/all";
export const GLOW_STATS_IMAGE = "/assets/images/lumieNightCream.png";
export const GLOW_STATS_ALT = `${brandName} vitamin C radiance serum`;

export const FEATURES = [
  {
    title: "Thoughtful Formulas",
    description: "Serums, creams, cleansers and body care made for daily use",
    icon: "flask",
  },
  {
    title: "Honest Language",
    description: "Clear, cosmetic-grade descriptions without exaggerated claims",
    icon: "leaf",
  },
  {
    title: "Secure Shopping",
    description: "Safe and protected transactions",
    icon: "shield",
  },
  {
    title: "Nationwide Delivery",
    description: "Swift delivery across Pakistan",
    icon: "truck",
  },
] as const;

export const HOME_FAQ_TITLE_BEFORE = "Your";
export const HOME_FAQ_TITLE_AFTER = "Questions, Answered";
export const HOME_FAQ_IMAGE = "/assets/images/vitaminCRadianceSerum.png";
export const HOME_FAQ_IMAGE_ALT = `${brandName} PDRN serum`;

export const HOME_FAQ = [
  {
    id: "skin-types",
    question: `Are ${brandName}'s products suitable for all skin types?`,
    answer:
      "Zermae formulas are made for daily use across common skin needs. Read each product description, start with a patch test if your skin is reactive, and choose the texture that feels right for your routine.",
  },
  {
    id: "ingredients",
    question: `What makes ${brandName}'s ingredients unique?`,
    answer:
      "We keep formulas considered and the language honest — botanical ingredients described in clear, cosmetic-grade terms, without inflated promises. Every product is meant to feel simple, calm and true to the skin.",
  },
  {
    id: "tracking",
    question: "How do I track my order?",
    answer:
      "After checkout, look up a guest order at /orders/lookup with your email and order number. Signed-in members can also follow status under Account, Orders.",
  },
] as const;

export const FOOTER_SOCIAL = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com/zermae", icon: "facebook" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/zermae", icon: "instagram" },
  { id: "pinterest", label: "Pinterest", href: "https://pinterest.com/zermae", icon: "pinterest" },
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
    second: "Ritual",
    image: "/assets/images/pdrnSerum.png",
    alt: `${brandName} amino acid gel cleanser`,
    tone: "mint",
  },
  new: {
    first: "New",
    second: "Arrivals",
    image: "/assets/images/clgnCollagenPeelOffMask.png",
    alt: `${brandName} Coco Velvet body polish`,
    tone: "olive",
  },
  serums: {
    first: "Daily",
    second: "Serums",
    image: "/assets/images/lumieNightCream.png",
    alt: `${brandName} vitamin C radiance serum`,
    tone: "olive",
  },
  creams: {
    first: "Comforting",
    second: "Creams",
    image: "/assets/images/aminoAcidGelCleanser.png",
    alt: `${brandName} Lumie night cream`,
    tone: "olive",
  },
  cleansers: {
    first: "Gentle",
    second: "Cleansers",
    image: "/assets/images/pdrnSerum.png",
    alt: `${brandName} amino acid gel cleanser`,
    tone: "mint",
  },
  body: {
    first: "Body",
    second: "Care",
    image: "/assets/images/cocoVelvetBodyPolish.png",
    alt: `${brandName} Buff Me Bright body polish`,
    tone: "olive",
  },
};

export const RITUAL_FEATURE_TITLE = "Care Made For";
export const RITUAL_FEATURE_MARK = "Skin";

export const RITUAL_FEATURE_NOTES = [
  {
    id: "pure",
    title: "Pure Ingredients",
    description: "Botanical formulas chosen for daily comfort, described in clear cosmetic-grade language.",
    icon: "leaf",
  },
  {
    id: "simple",
    title: "Simple Steps",
    description: "A calm routine you can keep — cleanse, treat and nourish without extra noise.",
    icon: "drop",
  },
] as const;

export const COLLECTION_RITUALS: Record<
  string,
  {
    title: string;
    mark: string;
    notes: readonly [
      { title: string; description: string; icon: "leaf" | "drop" },
      { title: string; description: string; icon: "leaf" | "drop" },
    ];
  }
> = {
  all: {
    title: RITUAL_FEATURE_TITLE,
    mark: RITUAL_FEATURE_MARK,
    notes: RITUAL_FEATURE_NOTES,
  },
  new: {
    title: "Fresh Formulas For",
    mark: "Now",
    notes: [
      {
        title: "New Rituals",
        description: "Recently added care for skin that wants a considered start, not a crowded shelf.",
        icon: "leaf",
      },
      {
        title: "Daily Comfort",
        description: "Textures made to feel calm in use, from the first cleanse to the last drop.",
        icon: "drop",
      },
    ],
  },
  serums: {
    title: "Drops Made For",
    mark: "Glow",
    notes: [
      {
        title: "Targeted Care",
        description: "A few considered drops to brighten, even tone and keep skin looking fresh.",
        icon: "drop",
      },
      {
        title: "Light Texture",
        description: "Serums that sit comfortably under cream, made for real morning and night routines.",
        icon: "leaf",
      },
    ],
  },
  creams: {
    title: "Comfort For",
    mark: "Night",
    notes: [
      {
        title: "Lasting Softness",
        description: "Nourishing textures that restore comfort while skin rests, without heavy residue.",
        icon: "leaf",
      },
      {
        title: "Calm Finish",
        description: "Creams chosen to leave skin feeling cared for, balanced and at ease.",
        icon: "drop",
      },
    ],
  },
  cleansers: {
    title: "A Gentle",
    mark: "Cleanse",
    notes: [
      {
        title: "Kind To Skin",
        description: "A daily wash that leaves skin calm, fresh and comfortable — never stripped.",
        icon: "drop",
      },
      {
        title: "Clean Start",
        description: "The first step of the ritual, made to prepare skin for serum and cream.",
        icon: "leaf",
      },
    ],
  },
  body: {
    title: "Care Beyond",
    mark: "Face",
    notes: [
      {
        title: "Nourishing Body",
        description: "Textures for skin beyond the face, made for real routines after bath or shower.",
        icon: "leaf",
      },
      {
        title: "Soft Glow",
        description: "Body care that keeps skin comfortable, polished and quietly cared for.",
        icon: "drop",
      },
    ],
  },
};

export const AUTH_BANNERS = {
  login: { src: "/assets/images/pdrnSerum.png", alt: `${brandName} amino acid gel cleanser` },
  register: { src: "/assets/images/lumieNightCream.png", alt: `${brandName} vitamin C radiance serum` },
  adminLogin: { src: "/assets/images/vitaminCRadianceSerum.png", alt: `${brandName} PDRN serum` },
} as const;

export const INFO_STILLS = {
  about: { src: "/assets/images/pdrnSerum.png", alt: `${brandName} amino acid gel cleanser` },
  contact: { src: "/assets/images/aminoAcidGelCleanser.png", alt: `${brandName} Lumie night cream` },
} as const;
