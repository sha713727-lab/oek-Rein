"use client";

import { useEffect, useRef } from "react";

/** Autoplays muted loop only while in view — avoids many videos decoding at once. */
export function GalleryVideo({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let inView = false;

    const sync = () => {
      if (reduced || !inView || document.visibilityState !== "visible") {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.2);
        sync();
      },
      { threshold: [0, 0.2, 0.5], rootMargin: "40px 0px" },
    );
    io.observe(video);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    />
  );
}
