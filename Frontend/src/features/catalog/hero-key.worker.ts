/// <reference lib="webworker" />

import {
  createHeroKeyBuffers,
  keyHeroFrame,
  type HeroKeyBuffers,
  type HeroKeyQuality,
} from "@/features/catalog/hero-key";

export type HeroKeyRequest =
  | { type: "init"; canvas: OffscreenCanvas; quality: HeroKeyQuality }
  | { type: "quality"; quality: HeroKeyQuality }
  | { type: "frame"; bitmap: ImageBitmap; width: number; height: number };

export type HeroKeyResponse = { type: "ready" } | { type: "drawn" };

const scope = self as unknown as DedicatedWorkerGlobalScope;

let view: OffscreenCanvas | null = null;
let viewCtx: OffscreenCanvasRenderingContext2D | null = null;
let work: OffscreenCanvas | null = null;
let workCtx: OffscreenCanvasRenderingContext2D | null = null;
let buffers: HeroKeyBuffers | null = null;
let quality: HeroKeyQuality | null = null;

function renderFrame(bitmap: ImageBitmap, width: number, height: number) {
  if (!view || !viewCtx || !quality) {
    bitmap.close();
    return;
  }
  if (!work || work.width !== width || work.height !== height) {
    work = new OffscreenCanvas(width, height);
    workCtx = work.getContext("2d", { willReadFrequently: true, alpha: true });
  }
  if (!workCtx) {
    bitmap.close();
    return;
  }

  workCtx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const pixels = width * height;
  if (!buffers || buffers.pixels !== pixels) {
    buffers = createHeroKeyBuffers(pixels);
  }

  const frame = workCtx.getImageData(0, 0, width, height);
  const box = keyHeroFrame(frame, buffers, quality);
  if (!box) {
    return;
  }
  workCtx.putImageData(frame, 0, 0);

  const cw = box.maxX - box.minX + 1;
  const ch = box.maxY - box.minY + 1;
  if (view.width !== cw || view.height !== ch) {
    view.width = cw;
    view.height = ch;
  }
  viewCtx.clearRect(0, 0, cw, ch);
  viewCtx.drawImage(work, box.minX, box.minY, cw, ch, 0, 0, cw, ch);
}

scope.onmessage = (event: MessageEvent<HeroKeyRequest>) => {
  const message = event.data;
  if (message.type === "init") {
    view = message.canvas;
    viewCtx = view.getContext("2d", { alpha: true });
    quality = message.quality;
    return;
  }
  if (message.type === "quality") {
    quality = message.quality;
    return;
  }
  renderFrame(message.bitmap, message.width, message.height);
  // Backpressure: the page only sends the next frame once this one is drawn.
  scope.postMessage({ type: "drawn" } satisfies HeroKeyResponse);
};

scope.postMessage({ type: "ready" } satisfies HeroKeyResponse);
