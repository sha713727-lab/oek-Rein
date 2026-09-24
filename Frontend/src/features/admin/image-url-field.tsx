"use client";

import { useEffect, useId, useRef, useState } from "react";

import { CmsImage } from "@/features/media/cms-image";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

function isAllowed(file: File) {
  return ["image/png", "image/jpeg", "image/webp"].includes(file.type);
}

export function ImageUrlField({
  name,
  label,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [preview, setPreview] = useState(defaultValue);
  const [cleared, setCleared] = useState(false);
  const [hasNewFile, setHasNewFile] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function assignFile(file: File) {
    if (!isAllowed(file)) {
      setError("Use PNG, JPG, or WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (inputRef.current) {
      inputRef.current.files = transfer.files;
    }
    setError("");
    setCleared(false);
    setHasNewFile(true);
    // Keep previous URL as fallback if upload fails on Publish; file field wins when present.
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
  }

  function clear() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setCleared(true);
    setHasNewFile(false);
    setUrl("");
    setError("");
    setPreview((current) => {
      if (current.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return "";
    });
  }

  return (
    <div className="admin-product-field">
      <label className="admin-product-label" htmlFor={inputId}>
        {label}
      </label>
      {hint ? <p className="admin-product-kicker">{hint}</p> : null}
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={`${name}Cleared`} value={cleared ? "1" : "0"} />
      <input
        id={inputId}
        ref={inputRef}
        className="admin-product-upload-input"
        type="file"
        // Only name the field when a new file is queued so Publish does not multipart-encode empties.
        name={hasNewFile ? `${name}File` : undefined}
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
        className={`admin-storefront-stage${dragOver ? " is-over" : ""}`}
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
        aria-label={preview ? `Replace ${label}` : `Upload ${label}`}
      >
        {preview ? (
          preview.startsWith("blob:") ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={preview} alt="" className="admin-storefront-preview-img" />
          ) : (
            <CmsImage src={preview} alt="" width={160} height={160} className="admin-storefront-preview-img" />
          )
        ) : (
          <span className="admin-storefront-preview--empty">Drop a photo here or click to upload</span>
        )}
      </button>
      <div className="admin-storefront-image-actions">
        <button type="button" className="admin-orders-open" onClick={() => inputRef.current?.click()}>
          {preview ? "Replace" : "Upload"}
        </button>
        {preview ? (
          <button type="button" className="admin-product-delete" onClick={clear}>
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="admin-product-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="admin-product-kicker">PNG, JPG, or WEBP. Up to 5MB. Publish to update the live shop.</p>
      )}
    </div>
  );
}
