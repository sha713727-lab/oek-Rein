"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import {
  gsap,
  prefersReducedMotion,
  registerGsapPlugins,
  ScrollTrigger,
} from "@/features/motion/motion-config";

export type ProgressCurveSurface = "white" | "cream" | "forest";

const SURFACE_CSS: Record<ProgressCurveSurface, string> = {
  white: "#ffffff",
  cream: "var(--vd-cream, #f4f1eb)",
  forest: "var(--vd-footer, #204e4a)",
};

/** Scroll progress supplies p; velocity never does. */
export function lowerSurfacePath(progress: number): string {
  const p = Math.max(0, Math.min(0.78, progress));
  const W = 1000;
  const H = 100;
  // Higher c = deeper center bow (white dipping into the following surface).
  const c = 0.92;
  const edgeY = H * (1 - p);
  const controlY = H * (1 - c * (1 - p));
  return [
    `M 0 ${edgeY}`,
    `C ${W * 0.25} ${controlY} ${W * 0.75} ${controlY} ${W} ${edgeY}`,
    `L ${W} ${H}`,
    `L 0 ${H}`,
    "Z",
  ].join(" ");
}

type ProgressCurveProps = {
  from: ProgressCurveSurface;
  to: ProgressCurveSurface;
  className?: string;
};

/**
 * M06 — one shared curved edge between two surfaces.
 * Cap background = preceding (A); SVG fill = following (B).
 */
export function ProgressCurve({ from, to, className }: ProgressCurveProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) {
      return;
    }

    if (from === to) {
      return;
    }

    const paint = (p: number) => {
      path.setAttribute("d", lowerSurfacePath(p));
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        coarse: "(pointer: coarse)",
        mobile: "(max-width: 767px)",
        desktop: "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduce, coarse, mobile, desktop } = context.conditions as {
          reduce: boolean;
          coarse: boolean;
          mobile: boolean;
          desktop: boolean;
        };

        const staticMode = reduce || coarse || mobile || !desktop || prefersReducedMotion();
        if (staticMode) {
          paint(0.38);
          return;
        }

        const proxy = { p: 0 };
        const DEPTH = 0.78;
        const quick = gsap.quickTo(proxy, "p", {
          duration: 0.3,
          ease: "power2.out",
          onUpdate: () => paint(proxy.p),
        });

        const syncImmediate = (progress: number) => {
          gsap.killTweensOf(proxy);
          proxy.p = Math.max(0, Math.min(DEPTH, progress * DEPTH));
          paint(proxy.p);
        };

        const trigger = ScrollTrigger.create({
          trigger: wrap,
          start: "-10% 100%",
          end: "-30% 0%",
          onUpdate: (self) => {
            quick(self.progress * DEPTH);
          },
          onRefresh: (self) => {
            syncImmediate(self.progress);
          },
        });

        syncImmediate(trigger.progress);

        return () => {
          gsap.killTweensOf(proxy);
          trigger.kill();
        };
      },
    );

    return () => mm.revert();
  }, [from, to]);

  if (from === to) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className={["home-progress-curve", className].filter(Boolean).join(" ")}
      style={
        {
          "--curve-from": SURFACE_CSS[from],
          "--curve-to": SURFACE_CSS[to],
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
        <path ref={pathRef} d={lowerSurfacePath(0.38)} />
      </svg>
    </div>
  );
}
