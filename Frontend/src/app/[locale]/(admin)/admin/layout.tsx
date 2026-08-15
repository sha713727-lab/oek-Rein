import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ADMIN_ROLES } from "@/constants/roles";
import { AdminHeader } from "@/features/admin/admin-header";
import { getSessionUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  return (
    <div className="admin-shell">
      <AdminHeader name={user.name} email={user.email} />
      <div className="admin-shell-main">{children}</div>
    </div>
  );
}
