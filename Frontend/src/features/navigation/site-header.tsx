"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { IconBag, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from "@/components/icons/icons";
import { Logo } from "@/components/ui/logo";
import { NAV_ITEMS } from "@/constants/site";
import { SearchModal } from "@/features/navigation/search-modal";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  cartCount: number;
  wishlistCount: number;
};

function formatBadge(count: number): string {
  return count > 9 ? "9+" : String(count);
}

function isNavActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader({ isAuthenticated, cartCount, wishlistCount }: SiteHeaderProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const path = pathname.replace(/\/$/, "") || "/";
  const isHomePage = path === "/" || path === "/en";
  const isDarkHeaderPage =
    isHomePage ||
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
    path.startsWith("/en/contact");
  const headerToneClass = isDarkHeaderPage ? "site-header-dark" : "site-header-light";
  const headerIndicatorClass = isDarkHeaderPage ? "bg-brand-primary" : "bg-white";

  return (
    <header className="site-header site-header-transparent">
      <div className="site-header-shell">
        <div className="min-w-0 flex-1">
          <Logo theme={isDarkHeaderPage ? "dark" : "light"} size="nav" />
        </div>
        <nav className="site-header-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
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
              className="site-header-icon-wrap site-header-icon-btn hidden sm:inline-flex"
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
            <Link
              href="/cart"
              className="site-header-icon-wrap site-header-icon-btn"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            >
              <IconBag />
              {cartCount > 0 ? <span className="site-header-icon-badge">{formatBadge(cartCount)}</span> : null}
            </Link>
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
          <nav className="flex flex-col gap-5" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className="site-header-link site-header-dark"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
