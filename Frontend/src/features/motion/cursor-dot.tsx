"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, select, summary, label, [role='button'], input, textarea";

/** Lime dot that trails the pointer and swells over anything clickable. */
export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) {
      return;
    }
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let started = false;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        started = true;
        currentX = targetX;
        currentY = targetY;
        dot.classList.add("is-active");
      }
      const target = event.target;
      const hovering = target instanceof Element ? Boolean(target.closest(INTERACTIVE)) : false;
      dot.classList.toggle("is-hover", hovering);
    };

    const onLeave = () => {
      started = false;
      dot.classList.remove("is-active", "is-hover");
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />;
}
