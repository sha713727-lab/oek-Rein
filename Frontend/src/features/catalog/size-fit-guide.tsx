import { IconBalance, IconHorse, IconSaddle } from "@/components/icons/icons";
import { PillCta } from "@/features/motion/pill-cta";

const FIT_TIPS = [
  {
    title: "Work with a fitter",
    description: "When possible, measure with a professional saddle fitter before you order.",
    Icon: IconHorse,
  },
  {
    title: "Match tree and seat",
    description: "Choose a tree and seat size that suits both horse and rider for balanced comfort.",
    Icon: IconSaddle,
  },
  {
    title: "Share your measurements",
    description: "For custom pieces, send us measurements and we will help confirm the right fit.",
    Icon: IconBalance,
  },
] as const;

/** Size & fit pathway — tips plus link to the full size guide hub. */
export function SizeFitGuide() {
  return (
    <section className="features-section home-size-guide" aria-labelledby="size-guide-title">
      <div className="features-inner">
        <header className="features-header">
          <h2 id="size-guide-title" className="features-heading">
            Not sure what size you need?
          </h2>
          <p className="features-support">Find the right saddle and tack size with our simple fit guide.</p>
        </header>
        <ul className="features-grid">
          {FIT_TIPS.map(({ title, description, Icon }) => (
            <li key={title} className="feature-item">
              <span className="feature-icon">
                <Icon />
              </span>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{description}</p>
            </li>
          ))}
        </ul>
        <div className="best-sellers-actions">
          <PillCta href="/size-guide" className="best-sellers-cta">
            View Size Guide
          </PillCta>
        </div>
      </div>
    </section>
  );
}
