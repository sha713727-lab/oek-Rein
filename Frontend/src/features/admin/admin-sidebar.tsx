"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { IconClose, IconMenu } from "@/components/icons/icons";
import { Logo } from "@/components/ui/logo";
import { ADMIN_NAV } from "@/constants/admin";
import { brandAdminHomeLabel } from "@/constants/brand";
import { ADMIN_NAV_ICONS } from "@/features/admin/admin-nav-icons";
import { cn } from "@/lib/cn";

function navActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (href === "/admin/inventory") {
    return pathname.startsWith("/admin/inventory") || pathname.startsWith("/admin/products");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="admin-sidebar-nav" aria-label="Admin">
      {ADMIN_NAV.map((item) => {
        const Icon = ADMIN_NAV_ICONS[item.id];
        const active = navActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn("admin-sidebar-link", active && "is-active")}
            onClick={() => setOpen(false)}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button type="button" className="admin-sidebar-toggle" aria-label="Open menu" onClick={() => setOpen(true)}>
        <IconMenu />
      </button>
      {open ? (
        <button type="button" className="admin-sidebar-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside className={cn("admin-sidebar", open && "is-open")}>
        <div className="admin-sidebar-brand">
          <Link href="/admin" className="admin-sidebar-logo" aria-label={brandAdminHomeLabel} onClick={() => setOpen(false)}>
            <Logo theme="dark" size="nav" linked={false} />
          </Link>
          <button type="button" className="admin-sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <IconClose />
          </button>
        </div>
        {links}
      </aside>
    </>
  );
}
