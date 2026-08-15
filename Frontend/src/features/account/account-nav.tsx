"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CUSTOMER_DASHBOARD_NAV } from "@/constants/account";
import { cn } from "@/lib/cn";

export function AccountNav() {
  const pathname = usePathname() ?? "/account";
  return (
    <aside className="customer-dashboard-sidebar" aria-label="Account navigation">
      <p className="customer-dashboard-sidebar-label">My Account</p>
      <nav className="customer-dashboard-nav">
        {CUSTOMER_DASHBOARD_NAV.map((item) => {
          const active = item.path === "/account" ? pathname === "/account" : pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn("customer-dashboard-nav-link", active && "customer-dashboard-nav-link--active")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
