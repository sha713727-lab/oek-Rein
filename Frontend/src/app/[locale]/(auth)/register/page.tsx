import { redirect } from "next/navigation";

import { AUTH_BANNERS } from "@/constants/site";
import { AuthPageFrame } from "@/features/auth/auth-page-frame";
import { RegisterForm } from "@/features/auth/register-form";
import { getSessionUser } from "@/lib/session";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/account");
  }
  return (
    <AuthPageFrame image={AUTH_BANNERS.register.src} imageAlt={AUTH_BANNERS.register.alt}>
      <RegisterForm />
    </AuthPageFrame>
  );
}
