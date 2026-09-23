"use client";

import { useEffect, useRef } from "react";

import { heroVideoStartSec as defaultHeroVideoStartSec } from "@/constants/brand";

type HeroTransparentVideoProps = {
  src: string;
  className?: string;
  /** Playback starts here and loops back here (skips clipped side-face intro). */
  startSec?: number;
};

type KeyQuality = {
  workWidth: number;
  intervalMs: number;
  fringePasses: number;
  healPasses: number;
  despill: boolean;
  /** Key one frame, then pause the video instead of running per-frame. */
  stillOnly: boolean;
};

const FULL_QUALITY: KeyQuality = {
  workWidth: 560,
  intervalMs: 50,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
  stillOnly: false,
};

/** Phones / low-core devices: one keyed still, no per-frame pixel work. */
const LOW_POWER_QUALITY: KeyQuality = {
  workWidth: 360,
  intervalMs: 200,
  fringePasses: 2,
  healPasses: 2,
  despill: false,
  stillOnly: true,
};

const CROP_PAD = 6;

function pickQuality(): KeyQuality {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.matchMedia("(max-width: 900px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  return coarse || small || cores <= 4 ? LOW_POWER_QUALITY : FULL_QUALITY;
}

/**
 * Edge-flood keys the white plate, erodes pale fringe, then restores only
 * fully enclosed blaze holes so the horse reads as a clean cutout.
 * Masks are precomputed into typed arrays so each pass is allocation-free.
 */
export function HeroTransparentVideo({
  src,
  className = "",
  startSec = defaultHeroVideoStartSec,
}: HeroTransparentVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const videoSrc = String(src ?? "").trim();
  const loopStart = Number.isFinite(startSec) && startSec > 0 ? startSec : 0;

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoSrc || !root || !video || !canvas) {
      return;
    }

    const work = workRef.current ?? document.createElement("canvas");
    workRef.current = work;

    const workCtx = work.getContext("2d", { willReadFrequently: true, alpha: true });
    const viewCtx = canvas.getContext("2d", { alpha: true });
    if (!workCtx || !viewCtx) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let quality = pickQuality();
    let raf = 0;
    let running = true;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    let lastKey = 0;
    let stillDone = false;

    let pixels = 0;
    let plate = new Uint8Array(0);
    let core = new Uint8Array(0);
    let pale = new Uint8Array(0);
    let lum = new Uint8Array(0);
    let opaque = new Uint8Array(0);
    let scratch = new Int32Array(0);

    const targetSize = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;
      const scale = vw > quality.workWidth ? quality.workWidth / vw : 1;
      return {
        w: Math.max(1, Math.round(vw * scale)),
        h: Math.max(1, Math.round(vh * scale)),
      };
    };

    const ensureBuffers = (count: number) => {
      if (pixels === count) return;
      pixels = count;
      plate = new Uint8Array(count);
      core = new Uint8Array(count);
      pale = new Uint8Array(count);
      lum = new Uint8Array(count);
      opaque = new Uint8Array(count);
      scratch = new Int32Array(count);
    };

    const keyFrame = () => {
      if (!running) return;
      const size = targetSize();
      if (!size) return;
      const { w, h } = size;

      if (work.width !== w || work.height !== h) {
        work.width = w;
        work.height = h;
      }
      ensureBuffers(w * h);

      workCtx.drawImage(video, 0, 0, w, h);
      const frame = workCtx.getImageData(0, 0, w, h);
      const { data } = frame;

      // 1) Classify every pixel once (plate / subject core / pale fringe / luma).
      for (let p = 0, i = 0; p < pixels; p += 1, i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        const max = r > g ? (r > b ? r : b) : g > b ? g : b;
        const min = r < g ? (r < b ? r : b) : g < b ? g : b;
        const sat = max === 0 ? 0 : (max - min) / max;
        const l = (r + g + b) / 3;
        lum[p] = l;
        const isPlate = (l > 210 && sat < 0.28) || (l > 155 && sat < 0.16) || (l > 125 && sat < 0.1);
        // Chestnut / bay coat, or dark muzzle / eye / leather.
        const isCore = (r > b + 8 && r > 45 && l < 185 && l > 28 && sat > 0.08) || (l < 78 && sat < 0.35);
        plate[p] = isPlate ? 1 : 0;
        core[p] = isCore ? 1 : 0;
        pale[p] = !isCore && (isPlate || l > 175) ? 1 : 0;
        opaque[p] = 1;
      }

      // 2) Flood the white plate inward from the frame edges.
      let top = 0;
      const push = (p: number) => {
        if (opaque[p] === 0 || core[p] === 1 || plate[p] === 0) return;
        opaque[p] = 0;
        scratch[top++] = p;
      };
      const lastRow = pixels - w;
      for (let x = 0; x < w; x += 1) {
        push(x);
        push(lastRow + x);
      }
      for (let y = 0; y < h; y += 1) {
        push(y * w);
        push(y * w + w - 1);
      }
      while (top > 0) {
        const p = scratch[--top] ?? 0;
        const x = p % w;
        if (x > 0) push(p - 1);
        if (x < w - 1) push(p + 1);
        if (p >= w) push(p - w);
        if (p < lastRow) push(p + w);
      }

      // 3) Erode the pale halo welded to the silhouette.
      for (let pass = 0; pass < quality.fringePasses; pass += 1) {
        let killed = 0;
        for (let y = 0; y < h; y += 1) {
          const row = y * w;
          const edgeRow = y === 0 || y === h - 1;
          for (let x = 0; x < w; x += 1) {
            const p = row + x;
            if (opaque[p] === 0 || pale[p] === 0) continue;
            const touchesClear =
              edgeRow ||
              x === 0 ||
              x === w - 1 ||
              opaque[p - 1] === 0 ||
              opaque[p + 1] === 0 ||
              opaque[p - w] === 0 ||
              opaque[p + w] === 0 ||
              opaque[p - w - 1] === 0 ||
              opaque[p - w + 1] === 0 ||
              opaque[p + w - 1] === 0 ||
              opaque[p + w + 1] === 0;
            if (touchesClear) scratch[killed++] = p;
          }
        }
        if (killed === 0) break;
        for (let k = 0; k < killed; k += 1) opaque[scratch[k] ?? 0] = 0;
      }

      // 4) Restore blaze holes that are fully sealed by the subject.
      for (let pass = 0; pass < quality.healPasses; pass += 1) {
        let healed = 0;
        for (let y = 1; y < h - 1; y += 1) {
          const row = y * w;
          for (let x = 1; x < w - 1; x += 1) {
            const p = row + x;
            if (opaque[p] === 1 || plate[p] === 0) continue;
            const sealed =
              opaque[p - 1] === 1 &&
              opaque[p + 1] === 1 &&
              opaque[p - w] === 1 &&
              opaque[p + w] === 1 &&
              opaque[p - w - 1] === 1 &&
              opaque[p - w + 1] === 1 &&
              opaque[p + w - 1] === 1 &&
              opaque[p + w + 1] === 1;
            if (sealed) scratch[healed++] = p;
          }
        }
        if (healed === 0) break;
        for (let k = 0; k < healed; k += 1) opaque[scratch[k] ?? 0] = 1;
      }

      // 5) Write alpha, soften bright edges, and measure the crop in one pass.
      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      for (let y = 0; y < h; y += 1) {
        const row = y * w;
        const edgeRow = y === 0 || y === h - 1;
        for (let x = 0; x < w; x += 1) {
          const p = row + x;
          const i = p * 4;
          if (opaque[p] === 0) {
            data[i + 3] = 0;
            continue;
          }
          let alpha = 255;
          const l = lum[p] ?? 0;
          if (quality.despill && l > 150) {
            const touchesClear =
              edgeRow ||
              x === 0 ||
              x === w - 1 ||
              opaque[p - 1] === 0 ||
              opaque[p + 1] === 0 ||
              opaque[p - w] === 0 ||
              opaque[p + w] === 0 ||
              opaque[p - w - 1] === 0 ||
              opaque[p - w + 1] === 0 ||
              opaque[p + w - 1] === 0 ||
              opaque[p + w + 1] === 0;
            if (touchesClear) {
              const t = Math.min(1, (l - 150) / 80);
              const fade = 1 - t * 0.55;
              data[i] = (data[i] ?? 0) * fade;
              data[i + 1] = (data[i + 1] ?? 0) * fade;
              data[i + 2] = (data[i + 2] ?? 0) * fade;
              if (l > 200 && core[p] === 0) {
                alpha = Math.max(0, 255 - t * 220);
              }
            }
          }
          data[i + 3] = alpha;
          if (alpha > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX <= minX || maxY <= minY) return;

      workCtx.putImageData(frame, 0, 0);
      minX = Math.max(0, minX - CROP_PAD);
      minY = Math.max(0, minY - CROP_PAD);
      maxX = Math.min(w - 1, maxX + CROP_PAD);
      maxY = Math.min(h - 1, maxY + CROP_PAD);
      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      viewCtx.clearRect(0, 0, cw, ch);
      viewCtx.drawImage(work, minX, minY, cw, ch, 0, 0, cw, ch);
    };

    const clampToLoopStart = () => {
      if (loopStart <= 0) return;
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0 && loopStart >= duration - 0.05) {
        return;
      }
      if (video.currentTime < loopStart - 0.04) {
        video.currentTime = loopStart;
      }
    };

    const syncPlayback = () => {
      if (!running) return;
      if (quality.stillOnly || reduced || !inView || !pageVisible) {
        video.pause();
        return;
      }
      clampToLoopStart();
      void video.play().catch(() => undefined);
    };

    const restartLoop = () => {
      video.currentTime = loopStart > 0 ? loopStart : 0;
      syncPlayback();
    };

    const tick = (now: number) => {
      if (!running) return;
      if (inView && pageVisible && !video.paused && !video.ended) {
        clampToLoopStart();
        if (now - lastKey >= quality.intervalMs) {
          lastKey = now;
          keyFrame();
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onSeeked = () => {
      keyFrame();
      if (quality.stillOnly) {
        stillDone = true;
        video.pause();
      }
    };

    const onReady = () => {
      if (loopStart > 0 && video.currentTime < loopStart - 0.04) {
        // `seeked` keys the frame once the decoder lands on the start time.
        video.currentTime = loopStart;
      } else {
        keyFrame();
        if (quality.stillOnly) stillDone = true;
      }
      lastKey = performance.now();
      syncPlayback();
    };

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncPlayback();
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.05);
        syncPlayback();
      },
      { root: null, threshold: [0, 0.05, 0.2], rootMargin: "80px 0px" },
    );
    io.observe(root);

    // Re-pick quality when the viewport crosses the phone breakpoint.
    const sizeQuery = window.matchMedia("(max-width: 900px)");
    const onQualityChange = () => {
      const next = pickQuality();
      if (next === quality) return;
      quality = next;
      stillDone = false;
      pixels = 0;
      if (!quality.stillOnly && !raf) raf = window.requestAnimationFrame(tick);
      keyFrame();
      syncPlayback();
    };
    sizeQuery.addEventListener("change", onQualityChange);

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("ended", restartLoop);
    document.addEventListener("visibilitychange", onVisibility);
    if (video.readyState >= 2) onReady();
    if (!quality.stillOnly || !stillDone) {
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      io.disconnect();
      sizeQuery.removeEventListener("change", onQualityChange);
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("ended", restartLoop);
      video.pause();
    };
  }, [videoSrc, loopStart]);

  if (!videoSrc) return null;

  return (
    <div ref={rootRef} className={`home-hero-subject ${className}`.trim()}>
      <div className="home-hero-subject-motion">
        <video
          ref={videoRef}
          className="home-hero-video-source"
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="home-hero-video-canvas" aria-hidden="true" />
      </div>
    </div>
  );
}
