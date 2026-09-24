"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function UnsavedGuard({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = formRef.current;
    if (!node) {
      return undefined;
    }
    const onInput = () => setDirty(true);
    // Publishing navigates away on purpose — the leave prompt must not block it.
    const onSubmit = () => setDirty(false);
    node.addEventListener("input", onInput);
    node.addEventListener("submit", onSubmit);
    return () => {
      node.removeEventListener("input", onInput);
      node.removeEventListener("submit", onSubmit);
    };
  }, []);

  useEffect(() => {
    if (!dirty) {
      return undefined;
    }
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  return <div ref={formRef}>{children}</div>;
}
