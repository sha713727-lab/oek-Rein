import type { ReactNode } from "react";

import { SmoothScroll } from "@/features/motion/smooth-scroll";
import { SiteFooter } from "@/features/navigation/site-footer";
import { SiteHeader } from "@/features/navigation/site-header";
import { readCart } from "@/lib/cart-cookie";
import { getSessionUser } from "@/lib/session";
import { getStorefront } from "@/lib/storefront";
import { readWishlist } from "@/lib/wishlist-cookie";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [user, cart, wishlist, storefront] = await Promise.all([
    getSessionUser(),
    readCart(),
    readWishlist(),
    getStorefront(),
  ]);
  return (
    <div className="flex min-h-screen flex-col">
      <SmoothScroll />
      <SiteHeader
        isAuthenticated={Boolean(user)}
        cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.ids.length}
        megaMenus={storefront.content.megaMenus}
        navLinks={storefront.content.navLinks}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter content={storefront.content} />
    </div>
  );
}
