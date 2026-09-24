"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  /** Instant LCP cutout shown until the first keyed video frame lands. */
  posterSrc?: string;
  /** Playback starts here and loops back here (skips clipped side-face intro). */
  startSec?: number;
};

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

const FALLBACK_QUALITY: HeroKeyQuality = {
  workWidth: 520,
  intervalMs: 60,
  fringePasses: 3,
  healPasses: 3,
  despill: true,
};

const FALLBACK_QUALITY_SMALL: HeroKeyQuality = {
  workWidth: 360,
  intervalMs: 80,
  fringePasses: 2,
  healPasses: 2,
  despill: false,
};

function isSmallDevice(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
  );
}

/**
 * Transparent hero cutout. A static poster paints immediately for LCP; the first
 * live frame is keyed on the page thread as soon as the decoder seeks to the
 * loop start; later frames go through a worker that returns ImageBitmaps so the
 * visible canvas never waits on OffscreenCanvas transfer.
 */
export function HeroTransparentVideo({
  src,
  className = "",
  posterSrc,
  startSec = defaultHeroVideoStartSec,
}: HeroTransparentVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoSrc = String(src ?? "").trim();
  const loopStart = Number.isFinite(startSec) && startSec > 0 ? startSec : 0;
  const [live, setLive] = useState(false);

  // Media fragment nudges Safari/Chrome to begin decoding near the loop start.
  const playbackSrc =
    loopStart > 0 && !videoSrc.includes("#")
      ? `${videoSrc}#t=${loopStart}`
      : videoSrc;

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoSrc || !root || !video || !canvas) {
      return;
    }

    const small = isSmallDevice();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let quality = small ? WORKER_QUALITY_SMALL : WORKER_QUALITY;

    let running = true;
    let inView = true;
    let pageVisible = document.visibilityState === "visible";
    let raf = 0;
    let lastKey = 0;
    let worker: Worker | null = null;
    let workerReady = false;
    let workerBusy = false;
    let firstPaintDone = false;

    const work = document.createElement("canvas");
    const workCtx = work.getContext("2d", { willReadFrequently: true, alpha: true });
    const viewCtx = canvas.getContext("2d", { alpha: true });
    let buffers: HeroKeyBuffers | null = null;

    if (!workCtx || !viewCtx) {
      return;
    }

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

    const paintBitmap = (bitmap: ImageBitmap) => {
      if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
      }
      viewCtx.clearRect(0, 0, bitmap.width, bitmap.height);
      viewCtx.drawImage(bitmap, 0, 0);
      bitmap.close();
      if (!firstPaintDone) {
        firstPaintDone = true;
        setLive(true);
      }
    };

    const keyOnPageThread = () => {
      const size = targetSize();
      if (!size || video.readyState < 2) return false;
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
      if (!box) return false;
      workCtx.putImageData(frame, 0, 0);
      const cw = box.maxX - box.minX + 1;
      const ch = box.maxY - box.minY + 1;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      viewCtx.clearRect(0, 0, cw, ch);
      viewCtx.drawImage(work, box.minX, box.minY, cw, ch, 0, 0, cw, ch);
      if (!firstPaintDone) {
        firstPaintDone = true;
        setLive(true);
      }
      return true;
    };

    const requestKey = () => {
      if (!running || video.readyState < 2) return;
      if (worker && workerReady && !workerBusy && firstPaintDone) {
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
            keyOnPageThread();
          });
        return;
      }
      keyOnPageThread();
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

    const startLoop = () => {
      if (raf || reduced) return;
      lastKey = 0;
      raf = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const shouldPlay = () => running && !reduced && inView && pageVisible;

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

    const onWorkerMessage = (event: MessageEvent<HeroKeyResponse>) => {
      if (event.data.type === "ready") {
        workerReady = true;
        worker?.postMessage({ type: "init", quality });
        return;
      }
      if (event.data.type === "frame") {
        workerBusy = false;
        paintBitmap(event.data.bitmap);
        return;
      }
      if (event.data.type === "empty") {
        workerBusy = false;
      }
    };

    if (typeof Worker !== "undefined" && typeof createImageBitmap === "function") {
      try {
        worker = new Worker(new URL("./hero-key.worker.ts", import.meta.url), { type: "module" });
        worker.addEventListener("message", onWorkerMessage);
        worker.addEventListener("error", () => {
          workerReady = false;
          worker = null;
          quality = small ? FALLBACK_QUALITY_SMALL : FALLBACK_QUALITY;
        });
      } catch {
        worker = null;
        quality = small ? FALLBACK_QUALITY_SMALL : FALLBACK_QUALITY;
      }
    } else {
      quality = small ? FALLBACK_QUALITY_SMALL : FALLBACK_QUALITY;
    }

    const onSeeked = () => {
      lastKey = 0;
      // First paint always on the page thread so the horse appears immediately.
      keyOnPageThread();
      syncPlayback();
    };

    const onReady = () => {
      if (loopStart > 0 && video.currentTime < loopStart - 0.04) {
        video.currentTime = loopStart;
      } else {
        keyOnPageThread();
        syncPlayback();
      }
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
      { root: null, threshold: [0, 0.05, 0.2], rootMargin: "120px 0px" },
    );
    io.observe(root);

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("ended", restartLoop);
    document.addEventListener("visibilitychange", onVisibility);

    // Kick decoding immediately — critical for iOS/Android cold loads.
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    try {
      video.load();
    } catch {
      /* ignore */
    }
    if (video.readyState >= 2) {
      onReady();
    }

    return () => {
      running = false;
      stopLoop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
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
      <div className={`home-hero-subject-motion${live ? " is-live" : ""}`}>
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt=""
            width={563}
            height={343}
            priority
            unoptimized
            className={`home-hero-poster${live ? " is-hidden" : ""}`}
            aria-hidden="true"
          />
        ) : null}
        <video
          ref={videoRef}
          className="home-hero-video-source"
          src={playbackSrc}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <canvas
          ref={canvasRef}
          className={`home-hero-video-canvas${live ? " is-live" : ""}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
