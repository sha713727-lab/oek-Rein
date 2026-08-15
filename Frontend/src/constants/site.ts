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

export const HERO_SLIDES = [
  { id: "hero1", src: "/assets/images/hero1.jpg", alt: `${brandName} considered skincare ritual 1` },
  { id: "hero2", src: "/assets/images/hero2.jpg", alt: `${brandName} considered skincare ritual 2` },
  { id: "hero3", src: "/assets/images/hero3.jpg", alt: `${brandName} considered skincare ritual 3` },
  { id: "hero4", src: "/assets/images/hero4.jpg", alt: `${brandName} considered skincare ritual 4` },
] as const;

export const SHOWCASE_HEADING = "Explore The Ritual";

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
export const GLOW_STATS_IMAGE = "/assets/images/pdrnSerum.png";
export const GLOW_STATS_ALT = `${brandName} amino acid gel cleanser`;

export const GLOW_STATS = [
  { id: "reviews", value: "120K+", label: "Customer Reviews" },
  { id: "products", value: "60+", label: "Brand Products" },
  { id: "users", value: "12M+", label: "Product Users" },
] as const;

export const SHOWCASE_CATEGORIES = [
  {
    id: "newArrival",
    slug: "new",
    layout: "editorial-right",
    title: "New Arrivals",
    description: "Fresh formulas for daily skin",
    href: "/collections/new",
    jpg: "/assets/images/newArrival.jpg",
    webp: "/assets/images/newArrival.webp",
    alt: `${brandName} new arrival skincare`,
  },
  {
    id: "serums",
    slug: "serums",
    layout: "editorial-left",
    title: "Serums",
    description: "Targeted care, simple steps",
    href: "/collections/serums",
    jpg: "/assets/images/summer.jpg",
    webp: "/assets/images/summer.webp",
    alt: `${brandName} serums`,
  },
  {
    id: "creams",
    slug: "creams",
    layout: "editorial-left-center",
    title: "Creams",
    description: "Comforting textures for real routines",
    href: "/collections/creams",
    jpg: "/assets/images/readyToWear.jpg",
    webp: "/assets/images/readyToWear.webp",
    alt: `${brandName} creams`,
  },
  {
    id: "cleansers",
    slug: "cleansers",
    layout: "editorial-center",
    title: "Cleansers",
    description: "A calm start to every day",
    href: "/collections/cleansers",
    jpg: "/assets/images/unstiched.jpg",
    webp: "/assets/images/unstiched.webp",
    alt: `${brandName} cleansers`,
  },
] as const;

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
export const HOME_FAQ_IMAGE = "/assets/images/pdrnSerum.png";
export const HOME_FAQ_IMAGE_ALT = `${brandName} amino acid gel cleanser`;

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
      "After checkout, follow your order from your account under Orders. If anything looks unclear, write to support@zermae.com and we will help you locate it.",
  },
] as const;

export const FOOTER_SOCIAL = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com/zermae", icon: "facebook" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com/zermae", icon: "instagram" },
  { id: "pinterest", label: "Pinterest", href: "https://pinterest.com/zermae", icon: "pinterest" },
] as const;

export const COLLECTION_HEROES: Record<
  string,
  { first: string; second: string; jpg: string; webp: string; alt: string }
> = {
  all: {
    first: "The",
    second: "Ritual",
    jpg: "/assets/images/newArrival.jpg",
    webp: "/assets/images/newArrival.webp",
    alt: `${brandName} skincare collection`,
  },
  new: {
    first: "New",
    second: "Arrivals",
    jpg: "/assets/images/newArrival.jpg",
    webp: "/assets/images/newArrival.webp",
    alt: `${brandName} new arrivals`,
  },
  serums: {
    first: "Daily",
    second: "Serums",
    jpg: "/assets/images/summer.jpg",
    webp: "/assets/images/summer.webp",
    alt: `${brandName} serums`,
  },
  creams: {
    first: "Comforting",
    second: "Creams",
    jpg: "/assets/images/readyToWear.jpg",
    webp: "/assets/images/readyToWear.webp",
    alt: `${brandName} creams`,
  },
  cleansers: {
    first: "Gentle",
    second: "Cleansers",
    jpg: "/assets/images/unstiched.jpg",
    webp: "/assets/images/unstiched.webp",
    alt: `${brandName} cleansers`,
  },
  body: {
    first: "Body",
    second: "Care",
    jpg: "/assets/images/summer.jpg",
    webp: "/assets/images/summer.webp",
    alt: `${brandName} body care`,
  },
};

export const AUTH_BANNERS = {
  login: { src: "/assets/images/readyToWear.jpg", alt: `${brandName} creams and daily care` },
  register: { src: "/assets/images/newArrival.jpg", alt: `${brandName} new arrivals` },
  adminLogin: { src: "/assets/images/hero1.jpg", alt: `${brandName} admin portal` },
} as const;
