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
    node.addEventListener("input", onInput);
    return () => node.removeEventListener("input", onInput);
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
