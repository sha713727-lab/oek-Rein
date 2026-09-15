"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { IconBag, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/icons/icons";
import { Logo } from "@/components/ui/logo";
import { NAV_ITEMS } from "@/constants/site";
import type { StorefrontNavLink } from "@/constants/storefront";
import { MiniCart } from "@/features/cart/mini-cart";
import { CmsImage } from "@/features/media/cms-image";
import { SearchModal } from "@/features/navigation/search-modal";
import { SiteToast } from "@/features/navigation/site-toast";
import { BAG_EVENT } from "@/lib/bag-events";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  cartCount: number;
  wishlistCount: number;
  navImages?: Record<string, { src: string; tone: "blush" | "mint" }>;
  navLinks?: StorefrontNavLink[];
};

function formatBadge(count: number): string {
  return count > 9 ? "9+" : String(count);
}

function isNavActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isStorefrontPath(path: string): boolean {
  return (
    path === "/" ||
    path === "/en" ||
    path.startsWith("/collections") ||
    path.startsWith("/en/collections") ||
    path.startsWith("/product/") ||
    path.startsWith("/en/product/") ||
    path.startsWith("/wishlist") ||
    path.startsWith("/en/wishlist") ||
    path.startsWith("/cart") ||
    path.startsWith("/en/cart") ||
    path.startsWith("/checkout") ||
    path.startsWith("/en/checkout") ||
    path.startsWith("/order-confirmation") ||
    path.startsWith("/en/order-confirmation") ||
    path.startsWith("/account") ||
    path.startsWith("/en/account") ||
    path.startsWith("/about-us") ||
    path.startsWith("/en/about-us") ||
    path.startsWith("/contact") ||
    path.startsWith("/en/contact") ||
    path.startsWith("/privacy") ||
    path.startsWith("/en/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/en/terms") ||
    path.startsWith("/shipping") ||
    path.startsWith("/en/shipping") ||
    path.startsWith("/returns") ||
    path.startsWith("/en/returns") ||
    path.startsWith("/faq") ||
    path.startsWith("/en/faq") ||
    path.startsWith("/orders") ||
    path.startsWith("/en/orders")
  );
}

export function SiteHeader({
  isAuthenticated,
  cartCount,
  wishlistCount,
  navImages = {},
  navLinks,
}: SiteHeaderProps) {
  const links = (navLinks ?? NAV_ITEMS.map((item) => ({ id: item.id, label: item.label, path: item.path, hidden: false }))).filter(
    (item) => !item.hidden,
  );
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = pathname.replace(/\/$/, "") || "/";

  useEffect(() => {
    const onBag = () => setBagOpen(true);
    window.addEventListener(BAG_EVENT, onBag);
    return () => window.removeEventListener(BAG_EVENT, onBag);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  const isDarkHeaderPage = isStorefrontPath(path);
  const headerToneClass = isDarkHeaderPage ? "site-header-dark" : "site-header-light";
  const headerIndicatorClass = isDarkHeaderPage ? "bg-brand-primary" : "bg-white";
  const badgeCount = cartCount;

  return (
    <header
      className={cn("site-header", scrolled || open ? "site-header-scrolled" : "site-header-transparent")}
      suppressHydrationWarning
    >
      {scrolled || open ? <div className="site-header-frost" aria-hidden="true" /> : null}
      <div className="site-header-shell">
        <div className="min-w-0 flex-1">
          <Logo theme={isDarkHeaderPage ? "dark" : "light"} size="nav" />
        </div>
        <nav className="site-header-nav" aria-label="Primary navigation">
          {links.map((item) => {
            const active = isNavActive(pathname, item.path);
            return (
              <Link key={item.id} href={item.path} className={cn("site-header-link group", headerToneClass)}>
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px transition-all duration-300",
                    active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                    headerIndicatorClass,
                  )}
                />
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
          <div className={cn("site-header-icons", headerToneClass)}>
            <button
              type="button"
              className="site-header-icon-btn"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
            >
              <IconSearch />
            </button>
            <Link
              href="/wishlist"
              className="site-header-icon-wrap site-header-icon-btn"
              aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : "Wishlist"}
            >
              <IconHeart />
              {wishlistCount > 0 ? <span className="site-header-icon-badge">{formatBadge(wishlistCount)}</span> : null}
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="site-header-icon-btn"
              aria-label={isAuthenticated ? "Account" : "Sign in"}
            >
              <IconUser />
            </Link>
            <button
              type="button"
              className="site-header-icon-wrap site-header-icon-btn"
              aria-label={badgeCount > 0 ? `Cart, ${badgeCount} items` : "Cart"}
              aria-expanded={bagOpen}
              onClick={() => setBagOpen(true)}
            >
              <IconBag />
              {badgeCount > 0 ? <span className="site-header-icon-badge">{formatBadge(badgeCount)}</span> : null}
            </button>
          </div>
          <button
            type="button"
            className={cn("site-header-mobile-toggle lg:hidden", headerToneClass)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="site-header-mobile-menu lg:hidden">
          <nav className="mobile-shop-nav" aria-label="Mobile navigation">
            <p className="mobile-shop-nav-eyebrow">Shop the range</p>
            <div className="mobile-shop-nav-grid">
              {links.map((item) => {
                const media = navImages[item.id];
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`mobile-shop-nav-card mobile-shop-nav-card--${media?.tone ?? "blush"}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mobile-shop-nav-visual">
                      <span className="mobile-shop-nav-orb" aria-hidden="true" />
                      {media?.src ? (
                        <CmsImage
                          src={media.src}
                          alt=""
                          fill
                          sizes="42vw"
                          className="mobile-shop-nav-image"
                        />
                      ) : null}
                    </span>
                    <span className="mobile-shop-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MiniCart open={bagOpen} onClose={() => setBagOpen(false)} />
      <SiteToast />
    </header>
  );
}
