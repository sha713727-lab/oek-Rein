"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 text-center">
      <h1 className="text-2xl tracking-[0.16em] uppercase">Something went wrong</h1>
      <p className="mt-4 text-text-sub">{error.message}</p>
    </div>
  );
}
