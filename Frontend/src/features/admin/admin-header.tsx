"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/ui/logo";
import { brandAdminHomeLabel } from "@/constants/brand";
import { logoutAction } from "@/features/auth/actions";

export function AdminHeader({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "A";
  return (
    <header className="site-header site-header-transparent admin-header">
      <div className="site-header-shell">
        <div className="min-w-0 flex-1">
          <Link href="/admin" className="admin-header-brand-link" aria-label={brandAdminHomeLabel}>
            <Logo theme="dark" size="nav" linked={false} />
          </Link>
        </div>
        <div className="admin-header-profile-wrap">
          <button
            type="button"
            className="admin-header-avatar-btn"
            aria-label={`${name} profile`}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="admin-header-avatar" aria-hidden="true">
              {initial}
            </span>
          </button>
          {open ? (
            <div className="admin-header-profile-menu">
              <p className="admin-header-profile-name">{name}</p>
              <p className="admin-header-profile-email">{email}</p>
              <form action={logoutAction}>
                <button type="submit" className="admin-header-signout">
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
