import { DEFAULT_RETURN_POLICY } from "@/constants/catalog";
import { getFreeShippingNote } from "@/constants/commerce";
import { LegalPage } from "@/features/content/legal-page";
import { getStorefront } from "@/lib/storefront";

export default async function ReturnsPage() {
  const storefront = await getStorefront();
  return (
    <LegalPage
      eyebrow="Policies"
      title="Returns & Exchange"
      lead="Unopened products may be exchanged within 14 days of delivery."
    >
      {DEFAULT_RETURN_POLICY.split("\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p>{getFreeShippingNote(storefront.commerce)}</p>
      <p>
        Opened or used skincare cannot be returned for hygiene reasons. Contact us with your order reference before
        sending anything back.
      </p>
    </LegalPage>
  );
}
