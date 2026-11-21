"use client";

import type { Slot } from "@/lib/slots";

export function SlotList({
  slots,
  selected,
  onSelect,
  emptyText = "no open slots right now — email me instead.",
}: {
  slots: Slot[];
  selected?: string | null;
  onSelect: (iso: string) => void;
  emptyText?: string;
}) {
  if (slots.length === 0) {
    return <p className="text-sm text-foreground/50">{emptyText}</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => (
        <button
          key={slot.iso}
          type="button"
          onClick={() => onSelect(slot.iso)}
          className={`rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
            selected === slot.iso
              ? "border-accent bg-accent/15 text-accent-bright"
              : "border-accent/20 bg-black/30 text-foreground/75 hover:border-accent/50"
          }`}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
