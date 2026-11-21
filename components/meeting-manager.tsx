"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlockedDay } from "@/lib/availability";
import type { Booking } from "@/lib/bookings";
import { StatusBanner } from "@/components/status-banner";

type Status = { type: "success" | "error"; text: string } | null;

export function MeetingManager({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blocked, setBlocked] = useState<BlockedDay[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
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

  const loadBlocked = useCallback(async () => {
    try {
      const response = await fetch("/api/availability");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        setBlocked(body);
      }
    } catch {
      // non-fatal — blocking is optional
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBlocked();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBlocked]);

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

  async function handleBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const date = blockDate.trim();
    if (!date) {
      setStatus({ type: "error", text: "error: pick a date to block." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setStatus({ type: "success", text: `✔ ${date} is now blocked.` });
        setBlockDate("");
        await loadBlocked();
      } else {
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
        text: "error: could not reach /api/availability. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleUnblock(date: string) {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/availability?date=${encodeURIComponent(date)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setStatus({ type: "success", text: `✔ ${date} is open again.` });
        await loadBlocked();
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
        text: "error: could not reach /api/availability. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  function startEdit(day: BlockedDay) {
    setEditingDate(day.date);
    setEditDate(day.date);
    setEditNote(day.note ?? "");
  }

  function cancelEdit() {
    setEditingDate(null);
    setEditDate("");
    setEditNote("");
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingDate) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/availability/${encodeURIComponent(editingDate)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: editDate.trim(),
            note: editNote.trim() || null,
          }),
        },
      );
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setStatus({ type: "success", text: "✔ blocked day updated." });
        cancelEdit();
        await loadBlocked();
      } else {
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
        text: "error: could not reach /api/availability. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...bookings].sort((a, b) => a.slot.localeCompare(b.slot));
  const sortedBlocked = [...blocked].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <StatusBanner status={status} />
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
                {booking.questions && (
                  <div className="mt-2 rounded-md border border-accent/15 bg-black/40 px-3 py-2">
                    <p className="text-xs tracking-widest text-accent uppercase">
                      their questions
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground/70">
                      {booking.questions}
                    </p>
                  </div>
                )}
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

      <div>
        <p className="text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">cal --block-days</span>
        </p>
        <form
          onSubmit={handleBlock}
          className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-accent/20 bg-black/30 p-4"
          noValidate
        >
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className="rounded-md border border-accent/25 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60 [color-scheme:dark]"
            aria-label="date to block"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            block day
          </button>
          <p className="text-xs text-foreground/40">
            blocked days disappear from /meet — vacations, interviews, finals.
          </p>
        </form>
        {sortedBlocked.length > 0 && (
          <ul className="mt-3 space-y-2 text-xs">
            {sortedBlocked.map((day) => (
              <li key={day.date}>
                {editingDate === day.date ? (
                  <form
                    onSubmit={handleSaveEdit}
                    className="flex flex-wrap items-center gap-2 rounded border border-accent/40 bg-accent/5 px-2 py-2"
                    noValidate
                  >
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="rounded border border-accent/25 bg-black/40 px-2 py-1 text-xs text-foreground outline-none focus:border-accent/60 [color-scheme:dark]"
                      aria-label="blocked date"
                    />
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      maxLength={120}
                      placeholder="note (vacation, finals…)"
                      className="min-w-0 flex-1 rounded border border-accent/25 bg-black/40 px-2 py-1 text-xs text-foreground outline-none placeholder:text-foreground/30 focus:border-accent/60"
                      aria-label="note"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                    >
                      [ save ]
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-foreground/60 transition-colors hover:text-foreground"
                    >
                      [ cancel ]
                    </button>
                  </form>
                ) : (
                  <span className="flex items-center gap-2 rounded border border-highlight/40 bg-highlight/10 px-2 py-1 text-highlight">
                    <span>
                      {day.date}
                      {day.note ? ` · ${day.note}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(day)}
                      disabled={busy}
                      aria-label={`edit ${day.date}`}
                      className="transition-opacity hover:opacity-70 disabled:opacity-50"
                    >
                      [ edit ]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnblock(day.date)}
                      disabled={busy}
                      aria-label={`unblock ${day.date}`}
                      className="transition-opacity hover:opacity-70 disabled:opacity-50"
                    >
                      [x]
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
