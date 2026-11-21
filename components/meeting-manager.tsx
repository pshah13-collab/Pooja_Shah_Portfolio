"use client";

import { useCallback, useState } from "react";
import type { Booking } from "@/lib/bookings";

type Status = { type: "success" | "error"; text: string } | null;

export function MeetingManager({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        setBookings(body);
      } else {
        setStatus({ type: "error", text: "error: could not load bookings." });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/bookings. is the server running?",
      });
    }
  }, []);

  async function handleStatus(id: string, next: string) {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        },
      );
      if (response.ok) {
        await loadBookings();
      } else {
        const body = await response.json().catch(() => null);
        setStatus({
          type: "error",
          text:
            body?.error ??
            `error: request failed with status ${response.status}.`,
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/bookings. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`rm booking ${id}? this cannot be undone.`)) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setStatus({ type: "success", text: "✔ booking removed." });
        await loadBookings();
      } else {
        const body = await response.json().catch(() => null);
        setStatus({
          type: "error",
          text:
            body?.error ??
            `error: request failed with status ${response.status}.`,
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/bookings. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...bookings].sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <div className="space-y-6">
      {status && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            status.type === "success"
              ? "border-accent/40 bg-accent/10 text-accent-bright"
              : "border-highlight/40 bg-highlight/10 text-highlight"
          }`}
        >
          {status.text}
        </p>
      )}
      <p className="text-sm">
        <span className="text-accent">pooja@scu:~$</span>{" "}
        <span className="text-foreground/60">cal --admin</span>
      </p>
      <div className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-foreground/50">
            no meeting requests yet
          </p>
        ) : (
          <ul className="space-y-4 text-sm">
            {sorted.map((booking) => (
              <li
                key={booking.id}
                className="border-b border-accent/10 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p>
                    <span className="text-accent-bright">{booking.name}</span>
                    {booking.company ? (
                      <span className="text-foreground/50">
                        {" "}
                        · {booking.company}
                      </span>
                    ) : null}{" "}
                    <span className="text-foreground/50">
                      &lt;{booking.email}&gt;
                    </span>
                  </p>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-xs ${
                      booking.status === "confirmed"
                        ? "border-accent/40 text-accent-bright"
                        : booking.status === "declined"
                          ? "border-foreground/30 text-foreground/50"
                          : "border-highlight/40 text-highlight"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="mt-1 text-foreground/70">{booking.topic}</p>
                <p className="mt-0.5 text-xs text-foreground/35">
                  {new Date(booking.slot).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · code: {booking.code} · id: {booking.id}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  {booking.status !== "confirmed" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(booking.id, "confirmed")}
                      disabled={busy}
                      className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                    >
                      [ confirm ]
                    </button>
                  )}
                  {booking.status !== "declined" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(booking.id, "declined")}
                      disabled={busy}
                      className="text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      [ decline ]
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(booking.id)}
                    disabled={busy}
                    className="text-highlight transition-colors hover:opacity-80 disabled:opacity-50"
                  >
                    [ rm ]
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
