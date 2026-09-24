"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  heroVideoMobileSrc as defaultHeroVideoMobileSrc,
  heroVideoPosterSrc as defaultHeroVideoPosterSrc,
} from "@/constants/brand";

type HeroTransparentVideoProps = {
  src: string;
  mobileSrc?: string;
  posterSrc?: string;
  className?: string;
  /** @deprecated Ignored — stacked-alpha assets are pre-cut to the loop. */
  startSec?: number;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision mediump float;
uniform sampler2D u_video;
varying vec2 v_uv;
void main() {
  vec2 vTex = vec2(v_uv.x, v_uv.y * 0.5 + 0.5);
  vec2 aTex = vec2(v_uv.x, v_uv.y * 0.5);
  vec3 rgb = texture2D(u_video, vTex).rgb;
  float a = texture2D(u_video, aTex).r;
  gl_FragColor = vec4(rgb, a);
}
`;

function preferMobileSrc(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
  );
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createStackedAlphaProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Transparent hero cutout from a stacked-alpha MP4 (color on top, alpha bottom).
 * Poster paints for LCP; WebGL composites live frames onto a canvas.
 */
export function HeroTransparentVideo({
  src,
  mobileSrc = defaultHeroVideoMobileSrc,
  posterSrc = defaultHeroVideoPosterSrc,
  className = "",
}: HeroTransparentVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoSrc = String(src ?? "").trim();
  const mobileVideoSrc = String(mobileSrc ?? "").trim();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current as VideoWithFrameCallback | null;
    const canvas = canvasRef.current;
    if (!videoSrc || !root || !video || !canvas) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return;
    }

    const activeSrc = preferMobileSrc() && mobileVideoSrc ? mobileVideoSrc : videoSrc;
    if (video.getAttribute("src") !== activeSrc) {
      video.src = activeSrc;
    }

    const gl =
      canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false }) ||
      canvas.getContext("experimental-webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
      });
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return;
    }

    const program = createStackedAlphaProgram(gl);
    if (!program) {
      return;
    }

    const posLoc = gl.getAttribLocation(program, "a_pos");
    const videoLoc = gl.getUniformLocation(program, "u_video");
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!buffer || !texture || posLoc < 0 || !videoLoc) {
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(videoLoc, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let running = true;
    let inView = true;
    let pageVisible = !document.hidden;
    let firstPaintDone = false;
    let raf = 0;
    let vfc = 0;
    const useVfc = typeof video.requestVideoFrameCallback === "function";

    const syncCanvasSize = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return false;
      const outW = vw;
      const outH = Math.max(1, Math.round(vh / 2));
      if (canvas.width !== outW || canvas.height !== outH) {
        canvas.width = outW;
        canvas.height = outH;
        gl.viewport(0, 0, outW, outH);
      }
      return true;
    };

    const drawFrame = () => {
      if (!running || video.readyState < 2) return;
      if (!syncCanvasSize()) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch {
        return;
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!firstPaintDone) {
        firstPaintDone = true;
        setLive(true);
      }
    };

    const stopLoop = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      if (vfc && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(vfc);
        vfc = 0;
      }
    };

    const scheduleNext = () => {
      if (!running || !shouldPlay()) return;
      if (useVfc && video.requestVideoFrameCallback) {
        vfc = video.requestVideoFrameCallback(() => {
          vfc = 0;
          drawFrame();
          scheduleNext();
        });
        return;
      }
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        drawFrame();
        scheduleNext();
      });
    };

    const shouldPlay = () => running && inView && pageVisible;

    const syncPlayback = () => {
      if (!shouldPlay()) {
        stopLoop();
        video.pause();
        return;
      }
      void video.play().then(
        () => {
          if (!running || !shouldPlay()) return;
          stopLoop();
          scheduleNext();
        },
        () => {
          /* Keep poster only when autoplay is blocked. */
          stopLoop();
          setLive(false);
        },
      );
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
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

    const onReady = () => {
      syncPlayback();
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    document.addEventListener("visibilitychange", onVisibility);

    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

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
      video.pause();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    };
  }, [videoSrc, mobileVideoSrc]);

  if (!videoSrc) return null;

  return (
    <div ref={rootRef} className={`home-hero-subject ${className}`.trim()}>
      <div className={`home-hero-subject-motion${live ? " is-live" : ""}`}>
        <span className="home-hero-ground-shadow" aria-hidden="true" />
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt=""
            width={563}
            height={343}
            preload
            fetchPriority="high"
            unoptimized
            className={`home-hero-poster${live ? " is-hidden" : ""}`}
            aria-hidden="true"
          />
        ) : null}
        <video
          ref={videoRef}
          className="home-hero-video-source"
          muted
          playsInline
          loop
          preload="metadata"
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
