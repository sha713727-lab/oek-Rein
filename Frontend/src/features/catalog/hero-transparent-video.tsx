"use client";

import { useEffect, useRef } from "react";

import { heroVideoStartSec as defaultHeroVideoStartSec } from "@/constants/brand";

type HeroTransparentVideoProps = {
  src: string;
  className?: string;
  /** Playback starts here and loops back here (skips clipped side-face intro). */
  startSec?: number;
};

const WORK_MAX_W = 560;
const CROP_PAD = 6;
/** Strip pale halo after flood-fill (anti-aliased white plate on the silhouette). */
const FRINGE_PASSES = 3;
/** Fill sealed white blaze holes only — never pixels that still touch transparency. */
const BLAZE_HEAL_PASSES = 3;
const KEY_INTERVAL_MS = 48;

/**
 * Edge-flood keys the white plate, erodes pale fringe, then restores only
 * fully enclosed blaze holes so the horse reads as a clean cutout.
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
    let raf = 0;
    let running = true;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    let lastKey = 0;
    let seen = new Uint8Array(0);
    let queue = new Int32Array(0);

    const targetSize = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;
      const scale = vw > WORK_MAX_W ? WORK_MAX_W / vw : 1;
      return {
        w: Math.max(1, Math.round(vw * scale)),
        h: Math.max(1, Math.round(vh * scale)),
      };
    };

    const lumAt = (data: Uint8ClampedArray, i: number) =>
      ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3;

    /** White / light-grey plate + soft anti-aliased fringe. */
    const isPlateOrFringe = (data: Uint8ClampedArray, i: number) => {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (r + g + b) / 3;
      if (lum > 210 && sat < 0.28) return true;
      if (lum > 155 && sat < 0.16) return true;
      if (lum > 125 && sat < 0.1) return true;
      return false;
    };

    /** Solid subject (coat / dark muzzle / eye) — never flood through. */
    const isSubjectCore = (data: Uint8ClampedArray, i: number) => {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const lum = (r + g + b) / 3;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      // Chestnut / bay
      if (r > b + 8 && r > 45 && lum < 185 && lum > 28 && sat > 0.08) return true;
      // Dark muzzle / eye / leather
      if (lum < 78 && sat < 0.35) return true;
      return false;
    };

    const countNeighbors = (data: Uint8ClampedArray, w: number, h: number, x: number, y: number) => {
      let opaque = 0;
      let clear = 0;
      let core = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) {
            clear += 1;
            continue;
          }
          const ni = (yy * w + xx) * 4;
          if ((data[ni + 3] ?? 0) > 24) {
            opaque += 1;
            if (isSubjectCore(data, ni)) core += 1;
          } else {
            clear += 1;
          }
        }
      }
      return { opaque, clear, core };
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

      const pixels = w * h;
      if (seen.length !== pixels) {
        seen = new Uint8Array(pixels);
        queue = new Int32Array(pixels);
      } else {
        seen.fill(0);
      }

      workCtx.drawImage(video, 0, 0, w, h);
      const frame = workCtx.getImageData(0, 0, w, h);
      const { data } = frame;

      // 1) Flood-fill plate from frame edges
      let qt = 0;
      const enqueue = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const p = y * w + x;
        const i = p * 4;
        if (seen[p]) return;
        if (isSubjectCore(data, i)) return;
        if (!isPlateOrFringe(data, i)) return;
        seen[p] = 1;
        queue[qt++] = p;
      };

      for (let x = 0; x < w; x += 1) {
        enqueue(x, 0);
        enqueue(x, h - 1);
      }
      for (let y = 0; y < h; y += 1) {
        enqueue(0, y);
        enqueue(w - 1, y);
      }

      let qh = 0;
      while (qh < qt) {
        const p = queue[qh++]!;
        data[p * 4 + 3] = 0;
        const x = p % w;
        const y = (p / w) | 0;
        enqueue(x - 1, y);
        enqueue(x + 1, y);
        enqueue(x, y - 1);
        enqueue(x, y + 1);
      }

      // 2) Erode pale halo stuck on the silhouette (the white “sticker” edge)
      for (let pass = 0; pass < FRINGE_PASSES; pass += 1) {
        const kill: number[] = [];
        for (let y = 0; y < h; y += 1) {
          for (let x = 0; x < w; x += 1) {
            const i = (y * w + x) * 4;
            if ((data[i + 3] ?? 0) === 0) continue;
            if (isSubjectCore(data, i)) continue;
            const lum = lumAt(data, i);
            const pale = isPlateOrFringe(data, i) || lum > 175;
            if (!pale) continue;
            const { clear } = countNeighbors(data, w, h, x, y);
            if (clear > 0) {
              kill.push(i);
            }
          }
        }
        for (const i of kill) {
          data[i + 3] = 0;
        }
        if (kill.length === 0) break;
      }

      // 3) Restore only fully sealed blaze holes (no path to transparency)
      for (let pass = 0; pass < BLAZE_HEAL_PASSES; pass += 1) {
        const restore: number[] = [];
        for (let y = 1; y < h - 1; y += 1) {
          for (let x = 1; x < w - 1; x += 1) {
            const i = (y * w + x) * 4;
            if ((data[i + 3] ?? 0) > 0) continue;
            if (!isPlateOrFringe(data, i)) continue;
            const { opaque, clear, core } = countNeighbors(data, w, h, x, y);
            if (clear === 0 && (core >= 2 || opaque === 8)) {
              restore.push(i);
            }
          }
        }
        for (const i of restore) {
          data[i + 3] = 255;
        }
        if (restore.length === 0) break;
      }

      // 4) Soft despill on remaining edge: knock down near-white RGB so olive shows clean
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          const i = (y * w + x) * 4;
          if ((data[i + 3] ?? 0) < 200) continue;
          const { clear } = countNeighbors(data, w, h, x, y);
          if (clear === 0) continue;
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const lum = (r + g + b) / 3;
          if (lum < 150) continue;
          // Pull bright edge toward neighboring mid tones
          const t = Math.min(1, (lum - 150) / 80);
          data[i] = Math.round(r * (1 - t * 0.55));
          data[i + 1] = Math.round(g * (1 - t * 0.55));
          data[i + 2] = Math.round(b * (1 - t * 0.55));
          if (lum > 200 && !isSubjectCore(data, i)) {
            data[i + 3] = Math.max(0, 255 - Math.round(t * 220));
          }
        }
      }

      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          if ((data[(y * w + x) * 4 + 3] ?? 0) > 20) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
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
      if (reduced || !inView || !pageVisible) {
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
        if (now - lastKey >= KEY_INTERVAL_MS) {
          lastKey = now;
          keyFrame();
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onReady = () => {
      if (loopStart > 0) {
        video.currentTime = loopStart;
      }
      keyFrame();
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

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("seeked", keyFrame);
    video.addEventListener("ended", restartLoop);
    document.addEventListener("visibilitychange", onVisibility);
    if (video.readyState >= 2) onReady();
    raf = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", keyFrame);
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
