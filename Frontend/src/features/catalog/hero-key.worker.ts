/// <reference lib="webworker" />

import {
  createHeroKeyBuffers,
  keyHeroFrame,
  type HeroKeyBuffers,
  type HeroKeyQuality,
} from "@/features/catalog/hero-key";

export type HeroKeyRequest =
  | { type: "init"; quality: HeroKeyQuality }
  | { type: "quality"; quality: HeroKeyQuality }
  | { type: "frame"; bitmap: ImageBitmap; width: number; height: number };

export type HeroKeyResponse =
  | { type: "ready" }
  | { type: "frame"; bitmap: ImageBitmap }
  | { type: "empty" };

const scope = self as unknown as DedicatedWorkerGlobalScope;

let work: OffscreenCanvas | null = null;
let workCtx: OffscreenCanvasRenderingContext2D | null = null;
let buffers: HeroKeyBuffers | null = null;
let quality: HeroKeyQuality | null = null;

async function renderFrame(bitmap: ImageBitmap, width: number, height: number) {
  if (!quality) {
    bitmap.close();
    scope.postMessage({ type: "empty" } satisfies HeroKeyResponse);
    return;
  }
  if (!work || work.width !== width || work.height !== height) {
    work = new OffscreenCanvas(width, height);
    workCtx = work.getContext("2d", { willReadFrequently: true, alpha: true });
  }
  if (!workCtx) {
    bitmap.close();
    scope.postMessage({ type: "empty" } satisfies HeroKeyResponse);
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
    scope.postMessage({ type: "empty" } satisfies HeroKeyResponse);
    return;
  }
  workCtx.putImageData(frame, 0, 0);

  const cw = box.maxX - box.minX + 1;
  const ch = box.maxY - box.minY + 1;
  const cropped = await createImageBitmap(work, box.minX, box.minY, cw, ch);
  scope.postMessage({ type: "frame", bitmap: cropped } satisfies HeroKeyResponse, [cropped]);
}

scope.onmessage = (event: MessageEvent<HeroKeyRequest>) => {
  const message = event.data;
  if (message.type === "init" || message.type === "quality") {
    quality = message.quality;
    return;
  }
  void renderFrame(message.bitmap, message.width, message.height);
};

scope.postMessage({ type: "ready" } satisfies HeroKeyResponse);
