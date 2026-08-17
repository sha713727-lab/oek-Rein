import { redirect } from "next/navigation";

import { ADMIN_ROLES } from "@/constants/roles";
import { AUTH_BANNERS } from "@/constants/site";
import { AdminLoginForm } from "@/features/admin/admin-login-form";
import { AuthPageFrame } from "@/features/auth/auth-page-frame";
import { getSessionUser } from "@/lib/session";
import { getStorefront } from "@/lib/storefront";

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user && ADMIN_ROLES.includes(user.role)) {
    redirect("/admin");
  }
  const storefront = await getStorefront();
  return (
    <AuthPageFrame image={storefront.content.authAdminSrc} imageAlt={AUTH_BANNERS.adminLogin.alt}>
      <AdminLoginForm />
    </AuthPageFrame>
  );
}
