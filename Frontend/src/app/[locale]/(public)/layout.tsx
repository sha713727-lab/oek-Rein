import type { ReactNode } from "react";

import { SiteFooter } from "@/features/navigation/site-footer";
import { SiteHeader } from "@/features/navigation/site-header";
import { readCart } from "@/lib/cart-cookie";
import { getSessionUser } from "@/lib/session";
import { readWishlist } from "@/lib/wishlist-cookie";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [user, cart, wishlist] = await Promise.all([getSessionUser(), readCart(), readWishlist()]);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        isAuthenticated={Boolean(user)}
        cartCount={cart.items.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.ids.length}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
