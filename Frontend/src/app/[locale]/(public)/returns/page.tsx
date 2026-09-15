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
      lead="Unused saddles, bridles, and tack may be exchanged within 14 days of delivery."
    >
      {DEFAULT_RETURN_POLICY.split("\n").map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p>{getFreeShippingNote(storefront.commerce)}</p>
      <p>
        Used, fitted, or leather-conditioned items cannot be returned. Contact us with your order reference before
        sending anything back.
      </p>
    </LegalPage>
  );
}
