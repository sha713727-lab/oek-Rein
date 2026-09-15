import { getFreeShippingNote } from "@/constants/commerce";
import { LegalPage } from "@/features/content/legal-page";
import { getStorefront } from "@/lib/storefront";

export default async function ShippingPage() {
  const storefront = await getStorefront();
  return (
    <LegalPage
      eyebrow="Policies"
      title="Shipping & Delivery"
      lead="Ships from Pakistan to riders across the United States and Canada."
    >
      <p>
        Orders ship from Pakistan to addresses across the United States and Canada. Transit times vary by destination and
        carrier. You will receive an order reference after checkout so you can follow up with client care if needed.
      </p>
      <p>{getFreeShippingNote(storefront.commerce)}</p>
      <p>
        Payment is cash on delivery where available for your region, or as confirmed at checkout. Please keep the order
        total ready for delivery. Card payments on this site may expand over time.
      </p>
    </LegalPage>
  );
}
