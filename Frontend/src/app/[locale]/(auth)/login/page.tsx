import { redirect } from "next/navigation";

import { AUTH_BANNERS } from "@/constants/site";
import { AuthPageFrame } from "@/features/auth/auth-page-frame";
import { LoginForm } from "@/features/auth/login-form";
import { getSessionUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/account");
  }
  return (
    <AuthPageFrame image={AUTH_BANNERS.login.src} imageAlt={AUTH_BANNERS.login.alt}>
      <LoginForm />
    </AuthPageFrame>
  );
}
