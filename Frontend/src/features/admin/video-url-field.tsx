"use client";

import { useEffect, useId, useRef, useState } from "react";

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = "video/mp4,video/webm";

function isAllowed(file: File) {
  return ["video/mp4", "video/webm"].includes(file.type);
}

export function VideoUrlField({
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
      setError("Use MP4 or WEBM.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Video must be 25MB or smaller.");
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
    setUrl("");
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
    <div className="admin-product-field admin-product-field--full">
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
          <video src={preview} className="admin-storefront-preview-img" muted playsInline controls={false} />
        ) : (
          <span className="admin-storefront-preview--empty">Drop an MP4 here or click to upload</span>
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
        <p className="admin-product-kicker">MP4 or WEBM. Up to 25MB. Publish to update the live hero.</p>
      )}
    </div>
  );
}
