import type { ComponentType } from "react";

import { IconFlask, IconLeafMark, IconShield, IconTruck } from "@/components/icons/icons";
import type { StorefrontContent } from "@/constants/storefront";

type IconProps = { className?: string | undefined };

const FEATURE_ICONS: Record<string, ComponentType<IconProps>> = {
  flask: IconFlask,
  leaf: IconLeafMark,
  shield: IconShield,
  truck: IconTruck,
};

export function Features({ content }: { content: StorefrontContent }) {
  return (
    <section className="features-section" aria-label="Why Zermae">
      <div className="features-inner">
        <ul className="features-grid">
          {content.features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon] ?? IconLeafMark;
            return (
              <li key={feature.title} className="feature-item">
                <span className="feature-icon">
                  <Icon />
                </span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
