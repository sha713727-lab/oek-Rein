import type { ComponentType } from "react";

import { IconFlask, IconLeafMark, IconShield, IconTruck } from "@/components/icons/icons";
import { FEATURES } from "@/constants/site";

type IconProps = { className?: string | undefined };

const FEATURE_ICONS: Record<(typeof FEATURES)[number]["icon"], ComponentType<IconProps>> = {
  flask: IconFlask,
  leaf: IconLeafMark,
  shield: IconShield,
  truck: IconTruck,
};

export function Features() {
  return (
    <section className="features-section" aria-label="Why Zermae">
      <div className="features-inner">
        <ul className="features-grid">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon];
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
