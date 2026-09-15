"use client";

import { useEffect, useRef } from "react";

type HeroTransparentVideoProps = {
  src: string;
  className?: string;
};

const WORK_MAX_W = 900;
const CROP_PAD = 10;

/**
 * Keys the edge-connected checkerboard, then crops to the opaque silhouette
 * so the horse + jockey fill the hero as a complete figure.
 */
export function HeroTransparentVideo({ src, className = "" }: HeroTransparentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    const work = workRef.current ?? document.createElement("canvas");
    workRef.current = work;

    const workCtx = work.getContext("2d", { willReadFrequently: true });
    const viewCtx = canvas.getContext("2d");
    if (!workCtx || !viewCtx) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let seen = new Uint8Array(0);
    let queue = new Int32Array(0);

    const targetSize = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) {
        return null;
      }
      const scale = vw > WORK_MAX_W ? WORK_MAX_W / vw : 1;
      return {
        w: Math.max(1, Math.round(vw * scale)),
        h: Math.max(1, Math.round(vh * scale)),
      };
    };

    const isBackdrop = (data: Uint8ClampedArray, i: number) => {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (r + g + b) / 3;
      return sat < 0.11 && lum > 138;
    };

    const keyFrame = () => {
      if (!running) {
        return;
      }
      const size = targetSize();
      if (!size) {
        return;
      }

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

      let qt = 0;
      const enqueue = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= w || y >= h) {
          return;
        }
        const p = y * w + x;
        if (seen[p] || !isBackdrop(data, p * 4)) {
          return;
        }
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
        const p = queue[qh++];
        if (p === undefined) {
          continue;
        }
        data[p * 4 + 3] = 0;
        const x = p % w;
        const y = (p / w) | 0;
        enqueue(x - 1, y);
        enqueue(x + 1, y);
        enqueue(x, y - 1);
        enqueue(x, y + 1);
      }

      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          if ((data[(y * w + x) * 4 + 3] ?? 0) > 24) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX <= minX || maxY <= minY) {
        return;
      }

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

    const tick = () => {
      if (!running) {
        return;
      }
      if (!video.paused && !video.ended) {
        keyFrame();
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onReady = () => {
      keyFrame();
      if (!reduced) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        keyFrame();
      }
    };

    video.addEventListener("loadeddata", onReady);
    if (video.readyState >= 2) {
      onReady();
    }
    raf = window.requestAnimationFrame(tick);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", onReady);
      video.pause();
    };
  }, [src]);

  return (
    <div className={`home-hero-subject ${className}`.trim()}>
      <video
        ref={videoRef}
        className="home-hero-video-source"
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="home-hero-video-canvas" aria-hidden="true" />
    </div>
  );
}
