import { TermsAndConditionsCopy } from "@/features/content/oakrein-policies";
import { LegalPage } from "@/features/content/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Policies"
      title="Terms & Conditions"
      lead="These Terms & Conditions govern your access to oakrein.com and any purchases made through our online store."
    >
      <TermsAndConditionsCopy />
    </LegalPage>
  );
}
