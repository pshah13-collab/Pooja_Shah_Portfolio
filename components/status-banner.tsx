"use client";

import type { FormStatus } from "@/lib/ui";

export function StatusBanner({
  status,
  onDismiss,
}: {
  status: FormStatus;
  onDismiss?: () => void;
}) {
  if (!status) return null;

  return (
    <p
      className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
        status.type === "success"
          ? "border-accent/40 bg-accent/10 text-accent-bright"
          : "border-highlight/40 bg-highlight/10 text-highlight"
      }`}
    >
      <span>{status.text}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="dismiss message"
          className="shrink-0 transition-opacity hover:opacity-70"
        >
          [x]
        </button>
      )}
    </p>
  );
}
