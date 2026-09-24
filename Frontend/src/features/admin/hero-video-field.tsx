"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

import { markAdminFormDirty } from "@/features/admin/unsaved-guard";
import { uploadAdminHeroVideoAction } from "@/features/admin/upload-admin-media";
import { useAdminUploadBusy } from "@/features/admin/upload-busy";
import { CmsImage } from "@/features/media/cms-image";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

const ALLOWED_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-quicktime"]);

function isAllowed(file: File) {
  if (ALLOWED_TYPES.has(file.type)) {
    return true;
  }
  const name = file.name.toLowerCase();
  return name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov");
}

/** Homepage hero: upload → chroma-key prerender → desktop / mobile / poster URLs. */
export function HeroVideoField({
  label,
  defaultSrc,
  defaultMobileSrc,
  defaultPosterSrc,
  hint,
}: {
  label: string;
  defaultSrc: string;
  defaultMobileSrc?: string;
  defaultPosterSrc?: string;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerPending, clearPending } = useAdminUploadBusy();
  const [src, setSrc] = useState(defaultSrc);
  const [mobileSrc, setMobileSrc] = useState(defaultMobileSrc ?? "");
  const [posterSrc, setPosterSrc] = useState(defaultPosterSrc ?? "");
  const [preview, setPreview] = useState(defaultSrc);
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function assignFile(file: File) {
    if (!isAllowed(file)) {
      setError("Use MP4, MOV, or WEBM.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Video must be 25MB or smaller.");
      return;
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setError("");
    setCleared(false);
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });

    const body = new FormData();
    body.set("file", file);
    registerPending();
    startTransition(async () => {
      try {
        const result = await uploadAdminHeroVideoAction(body);
        if (result.error || !result.src) {
          setError(result.error || "Hero video processing failed.");
          setPreview((current) => {
            if (current.startsWith("blob:")) {
              URL.revokeObjectURL(current);
            }
            return src || defaultSrc;
          });
          return;
        }
        setSrc(result.src);
        setMobileSrc(result.mobileSrc ?? "");
        setPosterSrc(result.posterSrc ?? "");
        markAdminFormDirty();
        setPreview((current) => {
          if (current.startsWith("blob:")) {
            URL.revokeObjectURL(current);
          }
          return result.src!;
        });
      } finally {
        clearPending();
      }
    });
  }

  function clear() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setCleared(true);
    setSrc("");
    setMobileSrc("");
    setPosterSrc("");
    setError("");
    markAdminFormDirty();
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return "";
    });
  }

  const showPosterFallback = Boolean(posterSrc) && !preview;

  return (
    <div className="admin-product-field admin-product-field--full">
      <label className="admin-product-label" htmlFor={inputId}>
        {label}
      </label>
      {hint ? <p className="admin-product-kicker">{hint}</p> : null}
      <input type="hidden" name="heroVideoSrc" value={src} />
      <input type="hidden" name="heroVideoMobileSrc" value={mobileSrc} />
      <input type="hidden" name="heroVideoPosterSrc" value={posterSrc} />
      <input type="hidden" name="heroVideoSrcCleared" value={cleared ? "1" : "0"} />
      <input
        id={inputId}
        ref={inputRef}
        className="admin-product-upload-input"
        type="file"
        accept={ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            assignFile(file);
          }
        }}
      />
      <button
        type="button"
        className={`admin-storefront-stage${dragOver ? " is-over" : ""}${pending ? " is-uploading" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files[0];
          if (file) {
            assignFile(file);
          }
        }}
        aria-label={preview || posterSrc ? `Replace ${label}` : `Upload ${label}`}
        disabled={pending}
      >
        {pending ? (
          <span className="admin-storefront-preview--empty">Processing…</span>
        ) : preview ? (
          <video
            src={preview}
            poster={posterSrc || undefined}
            className="admin-storefront-preview-img"
            muted
            playsInline
            loop
            autoPlay
            controls={false}
          />
        ) : showPosterFallback ? (
          <CmsImage src={posterSrc} alt="" width={160} height={160} className="admin-storefront-preview-img" />
        ) : (
          <span className="admin-storefront-preview--empty">Drop an MP4 or MOV here or click to upload</span>
        )}
      </button>
      <div className="admin-storefront-image-actions">
        <button type="button" className="admin-orders-open" onClick={() => inputRef.current?.click()} disabled={pending}>
          {pending ? "Processing…" : preview || posterSrc ? "Replace" : "Upload"}
        </button>
        {preview || posterSrc ? (
          <button type="button" className="admin-product-delete" onClick={clear} disabled={pending}>
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="admin-product-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="admin-product-kicker">
          {pending
            ? "Processing transparent hero video… this can take a minute."
            : "MP4, MOV, or WEBM. Up to 25MB. Wait for processing, then Publish to update the live hero."}
        </p>
      )}
    </div>
  );
}
