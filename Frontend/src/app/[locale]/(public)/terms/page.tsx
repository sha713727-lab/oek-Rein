import { brandName } from "@/constants/brand";
import { LegalPage } from "@/features/content/legal-page";
import { getStorefront } from "@/lib/storefront";

export default async function TermsPage() {
  const storefront = await getStorefront();
  return (
    <LegalPage
      eyebrow="Policies"
      title="Terms of Use"
      lead={`These terms cover browsing and purchasing from the ${brandName} storefront.`}
    >
      <p>
        Products are described in cosmetic-grade language for personal use. Colours, textures, and packaging may vary
        slightly from photographs. Prices are shown in {storefront.commerce.currency} and may change before an order is placed.
      </p>
      <p>
        Checkout is cash on delivery. By placing an order you confirm that the delivery details are accurate and that
        you will pay the courier the order total on arrival. We may cancel an order if an item is unavailable.
      </p>
      <p>
        Unopened products may be exchanged within 14 days of delivery. See Returns for the full exchange notes.
      </p>
    </LegalPage>
  );
}
