"use client";

import { useEffect, useRef } from "react";

import { heroVideoStartSec as defaultHeroVideoStartSec } from "@/constants/brand";
import {
  createHeroKeyBuffers,
  keyHeroFrame,
  type HeroKeyBuffers,
  type HeroKeyQuality,
} from "@/features/catalog/hero-key";
import type { HeroKeyResponse } from "@/features/catalog/hero-key.worker";

type HeroTransparentVideoProps = {
  src: string;
  className?: string;
  /** Playback starts here and loops back here (skips clipped side-face intro). */
  startSec?: number;
};

/** Keyed in a worker: the page thread only hands over decoded frames. */
const WORKER_QUALITY: HeroKeyQuality = {
  workWidth: 560,
  intervalMs: 40,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
};

const WORKER_QUALITY_SMALL: HeroKeyQuality = {
  workWidth: 420,
  intervalMs: 50,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
};

/** No worker available — the key runs on the page thread, so spend far less. */
const FALLBACK_QUALITY: HeroKeyQuality = {
  workWidth: 520,
  intervalMs: 60,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
};

const FALLBACK_QUALITY_SMALL: HeroKeyQuality = {
  workWidth: 360,
  intervalMs: 400,
  fringePasses: 2,
  healPasses: 2,
  despill: false,
};

const WORKER_HANDSHAKE_MS = 2500;

function isSmallDevice(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
  );
}

/**
 * Plays the hero clip as a transparent cutout. Frames are keyed in a worker on
 * an OffscreenCanvas so the pixel work never competes with scrolling; browsers
 * without that support fall back to keying on the page thread, and phones in
 * that fallback get a single keyed still instead of a per-frame loop.
 */
export function HeroTransparentVideo({
  src,
  className = "",
  startSec = defaultHeroVideoStartSec,
}: HeroTransparentVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoSrc = String(src ?? "").trim();
  const loopStart = Number.isFinite(startSec) && startSec > 0 ? startSec : 0;

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoSrc || !root || !video || !canvas) {
      return;
    }

    const small = isSmallDevice();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mode: "pending" | "worker" | "main" = "pending";
    let quality = small ? WORKER_QUALITY_SMALL : WORKER_QUALITY;
    /** Fallback on a phone: key one frame and leave the video parked. */
    let stillOnly = false;
    let stillDone = false;

    let running = true;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    let raf = 0;
    let lastKey = 0;

    let worker: Worker | null = null;
    let workerBusy = false;
    let handshake = 0;

    let work: HTMLCanvasElement | null = null;
    let workCtx: CanvasRenderingContext2D | null = null;
    let viewCtx: CanvasRenderingContext2D | null = null;
    let buffers: HeroKeyBuffers | null = null;

    const targetSize = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;
      const scale = vw > quality.workWidth ? quality.workWidth / vw : 1;
      return {
        width: Math.max(1, Math.round(vw * scale)),
        height: Math.max(1, Math.round(vh * scale)),
      };
    };

    const keyOnPageThread = () => {
      const size = targetSize();
      if (!size || !work || !workCtx || !viewCtx) return;
      const { width, height } = size;
      if (work.width !== width || work.height !== height) {
        work.width = width;
        work.height = height;
        workCtx.imageSmoothingQuality = "medium";
      }
      workCtx.drawImage(video, 0, 0, width, height);

      const pixels = width * height;
      if (!buffers || buffers.pixels !== pixels) {
        buffers = createHeroKeyBuffers(pixels);
      }
      const frame = workCtx.getImageData(0, 0, width, height);
      const box = keyHeroFrame(frame, buffers, quality);
      if (!box) return;
      workCtx.putImageData(frame, 0, 0);

      const cw = box.maxX - box.minX + 1;
      const ch = box.maxY - box.minY + 1;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      viewCtx.clearRect(0, 0, cw, ch);
      viewCtx.drawImage(work, box.minX, box.minY, cw, ch, 0, 0, cw, ch);
      stillDone = true;
    };

    const requestKey = () => {
      if (!running || video.readyState < 2) return;
      if (mode === "main") {
        keyOnPageThread();
        if (stillOnly) {
          video.pause();
          stopLoop();
        }
        return;
      }
      if (mode !== "worker" || !worker || workerBusy) return;
      const size = targetSize();
      if (!size) return;
      workerBusy = true;
      createImageBitmap(video)
        .then((bitmap) => {
          if (!running || !worker) {
            bitmap.close();
            workerBusy = false;
            return;
          }
          worker.postMessage({ type: "frame", bitmap, ...size }, [bitmap]);
        })
        .catch(() => {
          workerBusy = false;
        });
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

    const tick = (now: number) => {
      if (!running) {
        raf = 0;
        return;
      }
      raf = window.requestAnimationFrame(tick);
      clampToLoopStart();
      if (now - lastKey < quality.intervalMs) return;
      lastKey = now;
      requestKey();
    };

    function startLoop() {
      if (raf || stillOnly || mode === "pending") return;
      lastKey = 0;
      raf = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    }

    const shouldPlay = () => running && !reduced && inView && pageVisible && !(stillOnly && stillDone);

    const syncPlayback = () => {
      if (!shouldPlay()) {
        stopLoop();
        video.pause();
        return;
      }
      clampToLoopStart();
      void video.play().catch(() => undefined);
      startLoop();
    };

    const restartLoop = () => {
      video.currentTime = loopStart > 0 ? loopStart : 0;
      syncPlayback();
    };

    const startPageThreadMode = () => {
      if (mode !== "pending") return;
      window.clearTimeout(handshake);
      worker?.terminate();
      worker = null;
      mode = "main";
      quality = small ? FALLBACK_QUALITY_SMALL : FALLBACK_QUALITY;
      stillOnly = small;
      work = document.createElement("canvas");
      workCtx = work.getContext("2d", { willReadFrequently: true, alpha: true });
      viewCtx = canvas.getContext("2d", { alpha: true });
      requestKey();
      syncPlayback();
    };

    const onWorkerMessage = (event: MessageEvent<HeroKeyResponse>) => {
      if (event.data.type === "drawn") {
        workerBusy = false;
        return;
      }
      if (mode !== "pending" || !worker) return;
      window.clearTimeout(handshake);
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: "init", canvas: offscreen, quality }, [offscreen]);
      mode = "worker";
      requestKey();
      syncPlayback();
    };

    if (
      typeof Worker !== "undefined" &&
      typeof createImageBitmap === "function" &&
      typeof canvas.transferControlToOffscreen === "function"
    ) {
      try {
        worker = new Worker(new URL("./hero-key.worker.ts", import.meta.url), { type: "module" });
        worker.addEventListener("message", onWorkerMessage);
        worker.addEventListener("error", startPageThreadMode);
        handshake = window.setTimeout(startPageThreadMode, WORKER_HANDSHAKE_MS);
      } catch {
        worker = null;
      }
    }
    if (!worker) {
      startPageThreadMode();
    }

    const onSeeked = () => {
      lastKey = 0;
      requestKey();
    };

    const onReady = () => {
      if (loopStart > 0 && video.currentTime < loopStart - 0.04) {
        // `seeked` keys the frame once the decoder lands on the start time.
        video.currentTime = loopStart;
      } else {
        requestKey();
      }
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
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("ended", restartLoop);
    document.addEventListener("visibilitychange", onVisibility);
    if (video.readyState >= 2) {
      onReady();
    }

    return () => {
      running = false;
      stopLoop();
      window.clearTimeout(handshake);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("ended", restartLoop);
      video.pause();
      worker?.terminate();
      worker = null;
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
