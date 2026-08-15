"use client";

import { IconChevronUp } from "@/components/icons/icons";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      className="footer-scroll-top"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <IconChevronUp />
    </button>
  );
}
