import { IconMinus, IconPlus, IconSparkle } from "@/components/icons/icons";
import { brandName } from "@/constants/brand";
import type { StorefrontContent } from "@/constants/storefront";
import { CmsImage } from "@/features/media/cms-image";

export function HomeFaq({ content }: { content: StorefrontContent }) {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <div className="home-faq-inner">
        <figure className="home-faq-stage">
          <div className="home-faq-arch" aria-hidden="true">
            <span className="home-faq-glow" />
          </div>
          {content.faqImage ? (
            <CmsImage
              src={content.faqImage}
              alt={content.faqImageAlt || "Frequently asked questions"}
              width={226}
              height={597}
              sizes="(max-width: 899px) 18rem, 22rem"
              className="home-faq-cutout"
            />
          ) : null}
        </figure>
        <div className="home-faq-copy">
          <h2 id="home-faq-title" className="home-faq-title">
            Your {brandName} <IconSparkle className="home-faq-sparkle" /> Questions, Answered
          </h2>
          <div className="home-faq-list">
            {content.faqItems.map((item, index) => (
              <details key={item.id} className="home-faq-item" name="zermae-home-faq" open={index === 0}>
                <summary className="home-faq-question">
                  <span>{item.question}</span>
                  <span className="home-faq-toggle" aria-hidden="true">
                    <IconPlus className="home-faq-plus" />
                    <IconMinus className="home-faq-minus" />
                  </span>
                </summary>
                <p className="home-faq-answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
