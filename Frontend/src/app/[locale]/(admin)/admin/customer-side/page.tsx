import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ROLES } from "@/constants/roles";
import { updateCommerceSettingsAction } from "@/features/admin/storefront-actions";
import { getSessionUser } from "@/lib/session";
import { storefrontService } from "@/server/services/storefront/storefront.service";

export default async function AdminCustomerSidePage() {
  const user = await getSessionUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/admin/login");
  }
  const commerce = await storefrontService.getPublished();
  return (
    <>
      <h1 className="mb-6 text-3xl tracking-[0.18em] uppercase">Storefront</h1>
      <p className="mb-8 text-text-sub">
        Homepage rituals, hero slides, and on-skin media are published from the Next.js storefront. Commerce
        fees below apply at checkout.
      </p>
      <form action={updateCommerceSettingsAction} className="max-w-xl space-y-4">
        <Input label="Currency" name="currency" defaultValue={commerce.currency} required />
        <Input label="Standard shipping fee" name="standardShippingFee" type="number" min="0" defaultValue={commerce.standardShippingFee} required />
        <Input label="Free shipping threshold" name="freeShippingThreshold" type="number" min="0" defaultValue={commerce.freeShippingThreshold} required />
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="freeShippingEnabled" defaultChecked={commerce.freeShippingEnabled} />
          Free shipping enabled
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="taxEnabled" defaultChecked={commerce.taxEnabled} />
          Tax enabled
        </label>
        <Input label="Tax rate" name="taxRate" type="number" min="0" defaultValue={commerce.taxRate} required />
        <Input label="Tax label" name="taxLabel" defaultValue={commerce.taxLabel} required />
        <Button type="submit">Save commerce settings</Button>
      </form>
    </>
  );
}
