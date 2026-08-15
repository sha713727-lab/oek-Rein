import Image from "next/image";

import { IconMinus, IconPlus, IconSparkle } from "@/components/icons/icons";
import { brandName } from "@/constants/brand";
import {
  HOME_FAQ,
  HOME_FAQ_IMAGE,
  HOME_FAQ_IMAGE_ALT,
  HOME_FAQ_TITLE_AFTER,
  HOME_FAQ_TITLE_BEFORE,
} from "@/constants/site";

export function HomeFaq() {
  return (
    <section className="home-faq" aria-labelledby="home-faq-title">
      <div className="home-faq-inner">
        <figure className="home-faq-stage">
          <div className="home-faq-arch">
            <span className="home-faq-glow" aria-hidden="true" />
            <Image
              src={HOME_FAQ_IMAGE}
              alt={HOME_FAQ_IMAGE_ALT}
              width={480}
              height={900}
              className="home-faq-cutout"
            />
          </div>
        </figure>
        <div className="home-faq-copy">
          <h2 id="home-faq-title" className="home-faq-title">
            {HOME_FAQ_TITLE_BEFORE} {brandName}{" "}
            <IconSparkle className="home-faq-sparkle" /> {HOME_FAQ_TITLE_AFTER}
          </h2>
          <div className="home-faq-list">
            {HOME_FAQ.map((item, index) => (
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
