import "./globals.css";
import "./product-highlights.css";
import "./glow-stats.css";
import "./features.css";
import "./home-faq.css";
import "./footer.css";
import "./storefront.css";

import { Cormorant_Garamond, Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { brandDescription, brandName } from "@/constants/brand";
import { CookieBanner } from "@/features/consent/cookie-banner";
import { ThemeStyle } from "@/features/theme/theme-style";
import { getStorefront } from "@/lib/storefront";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://zermae.com"),
  title: {
    default: brandName,
    template: `%s · ${brandName}`,
  },
  description: brandDescription,
  applicationName: brandName,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const storefront = await getStorefront();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${plusJakarta.variable} ${poppins.variable} ${inter.variable} ${cormorant.variable} min-h-screen bg-brand-bg antialiased`}
      >
        <ThemeStyle theme={storefront.theme} />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
