import { getFreeShippingNote } from "@/constants/commerce";
import { LegalPage } from "@/features/content/legal-page";
import { getStorefront } from "@/lib/storefront";

export default async function ShippingPage() {
  const storefront = await getStorefront();
  return (
    <LegalPage
      eyebrow="Policies"
      title="Shipping & Delivery"
      lead="Nationwide delivery across Pakistan, usually within 3–5 working days."
    >
      <p>
        We ship with trusted couriers. Delivery times can vary by city and weather. You will receive an order reference
        after checkout so you can follow up with client care if needed.
      </p>
      <p>{getFreeShippingNote(storefront.commerce)}</p>
      <p>
        Payment is cash on delivery. Please keep the exact total ready for the courier. We do not take card payments on
        this site yet.
      </p>
    </LegalPage>
  );
}
