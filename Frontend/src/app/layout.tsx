import "./globals.css";
import "./home.css";
import "./product-highlights.css";
import "./glow-stats.css";
import "./features.css";
import "./home-testimonials.css";
import "./home-faq.css";
import "./footer.css";
import "./storefront.css";
import "./home-design.css";
import "./performance.css";

import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { brandDescription, brandName } from "@/constants/brand";
import { CookieBanner } from "@/features/consent/cookie-banner";
import { CursorDot } from "@/features/motion/cursor-dot";
import { ThemeStyle } from "@/features/theme/theme-style";
import { getStorefront } from "@/lib/storefront";

/**
 * Display: Fraunces — hero, section, product/category titles.
 * UI/body: Manrope — nav, buttons, prices, forms, product info.
 */
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: brandName,
    template: `%s · ${brandName}`,
  },
  description: brandDescription,
  applicationName: brandName,
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico?v=2"],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const storefront = await getStorefront();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <body className={`${manrope.className} min-h-screen bg-brand-bg antialiased`}>
        <ThemeStyle theme={storefront.theme} />
        {children}
        <CursorDot />
        <CookieBanner />
      </body>
    </html>
  );
}
