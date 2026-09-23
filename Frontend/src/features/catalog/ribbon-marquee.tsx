"use client";

import { useEffect, useRef } from "react";

import { heroWaveText } from "@/constants/brand";

const WAVE_X_START = -120;
const WAVE_X_END = 1560;
const WAVE_MID = 80;
/*
 * Amplitude stays well under the band's half-thickness (35 in viewBox units), so
 * the flat strip around y=80 is covered by lime at every x. That is what lets the
 * hero panel end on a straight edge without any of its sage peeking out.
 */
const WAVE_AMP = 26;
const WAVE_PERIOD = 520;
const WAVE_STEP = 24;

function sampleWave(x: number): number {
  return WAVE_MID + WAVE_AMP * Math.sin((2 * Math.PI * x) / WAVE_PERIOD);
}

/** Catmull-Rom style smoothing so the ribbon reads as one continuous curve. */
function buildSineGuide(): string {
  const points: Array<readonly [number, number]> = [];
  for (let x = WAVE_X_START; x <= WAVE_X_END; x += WAVE_STEP) {
    points.push([x, sampleWave(x)]);
  }
  const first = points[0];
  if (!first) {
    return "";
  }
  let path = `M${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const ahead = points[index + 2] ?? points[index + 1];
    if (!previous || !current || !next || !ahead) {
      continue;
    }
    const controlStartX = current[0] + (next[0] - previous[0]) / 6;
    const controlStartY = current[1] + (next[1] - previous[1]) / 6;
    const controlEndX = next[0] - (ahead[0] - current[0]) / 6;
    const controlEndY = next[1] - (ahead[1] - current[1]) / 6;
    path += ` C${controlStartX.toFixed(1)} ${controlStartY.toFixed(1)} ${controlEndX.toFixed(1)} ${controlEndY.toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
  }
  return path;
}

const WAVE_GUIDE = buildSineGuide();
const REPEAT_COUNT = 12;

type RibbonMarqueeProps = {
  /** Ribbon fill: lime band with green type, or green band with white type. */
  tone?: "lime" | "green";
  text?: string;
  pathId?: string;
  /** Tucks the band onto the hero panel's bottom edge instead of standing alone. */
  merged?: boolean;
};

export function RibbonMarquee({
  tone = "lime",
  text = heroWaveText,
  pathId = "ribbonMarqueePath",
  merged = false,
}: RibbonMarqueeProps) {
  const textPathRef = useRef<SVGTextPathElement>(null);
  const frameRef = useRef(0);
  const copy = `${text}   ✦   `.repeat(REPEAT_COUNT);

  useEffect(() => {
    let cancelled = false;
    const root = textPathRef.current?.ownerSVGElement?.closest(".ribbon-marquee") as HTMLElement | null;

    const run = () => {
      const textPath = textPathRef.current;
      if (cancelled || !textPath) {
        return;
      }
      const unit = textPath.getComputedTextLength() / REPEAT_COUNT;
      if (unit <= 0) {
        window.requestAnimationFrame(() => {
          if (!cancelled) {
            run();
          }
        });
        return;
      }
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        textPath.setAttribute("startOffset", "0");
        return;
      }
      const speed = 0.052;
      // Text-on-path relayout is costly; halve the rate on phones/tablets.
      const minFrameMs = window.matchMedia("(pointer: coarse)").matches ? 32 : 0;
      let offset = 0;
      let last = performance.now();
      let painted = last;
      let visible = true;

      const tick = (now: number) => {
        if (cancelled) return;
        if (visible && now - painted >= minFrameMs) {
          const delta = Math.min(now - last, 32);
          last = now;
          painted = now;
          offset = (offset + delta * speed) % unit;
          textPath.setAttribute("startOffset", String(offset - unit));
        } else if (!visible) {
          last = now;
        }
        frameRef.current = window.requestAnimationFrame(tick);
      };

      const io =
        root &&
        new IntersectionObserver(
          (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
          },
          { rootMargin: "120px 0px", threshold: 0 },
        );
      if (root && io) {
        io.observe(root);
      }

      frameRef.current = window.requestAnimationFrame(tick);

      return () => {
        io?.disconnect();
      };
    };

    let stopIo: (() => void) | undefined;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    void fontsReady.then(() => {
      if (!cancelled) {
        stopIo = run() ?? undefined;
      }
    });

    return () => {
      cancelled = true;
      stopIo?.();
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      className={`ribbon-marquee ribbon-marquee--${tone}${merged ? " ribbon-marquee--merged" : ""}`}
      aria-hidden="true"
    >
      <svg className="ribbon-marquee-svg" viewBox="0 0 1440 160">
        <path className="ribbon-marquee-band" d={WAVE_GUIDE} />
        <path id={pathId} className="ribbon-marquee-guide" d={WAVE_GUIDE} />
        {/* Isolate type so multiply on the band doesn’t muddy the lime text. */}
        <g className="ribbon-marquee-type-layer">
          <text className="ribbon-marquee-type" dominantBaseline="middle">
            <textPath href={`#${pathId}`} startOffset="0" ref={textPathRef}>
              {copy}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
