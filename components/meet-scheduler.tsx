"use client";

import { useCallback, useEffect, useState } from "react";
import { downloadIcs } from "@/lib/calendar-ics";
import { buildSlots, type Slot } from "@/lib/slots";
import { loadOpenQuestionLines } from "@/lib/notepad";
import { StatusBanner } from "@/components/status-banner";
import type { BlockedDay } from "@/lib/availability";
import type { Booking } from "@/lib/bookings";
import { SlotList } from "@/components/slot-list";
import { inputClasses } from "@/lib/ui";

type Status = { type: "success" | "error"; text: string } | null;

const stepLabel = "text-xs tracking-widest text-accent uppercase";

export function MeetScheduler({
  initialBookings,
  initialAvailability,
}: {
  initialBookings: Booking[];
  initialAvailability: BlockedDay[];
}) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    buildSlots(
      new Set(
        initialBookings
          .filter((b) => b.status !== "declined")
          .map((b) => b.slot),
      ),
      new Set(initialAvailability.map((a) => a.date)),
    ),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);

  const [manageCode, setManageCode] = useState("");
  const [managed, setManaged] = useState<Booking | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [notepadDraft, setNotepadDraft] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotepadDraft(loadOpenQuestionLines());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadActive = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        return body as Booking[];
      }
      setStatus({ type: "error", text: "error: could not load slots." });
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/bookings. is the server running?",
      });
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    const list = await loadActive();
    if (list) {
      let blocked = new Set<string>();
      try {
        const response = await fetch("/api/availability");
        const body = await response.json().catch(() => null);
        if (response.ok && Array.isArray(body)) {
          blocked = new Set(
            body.map((b: { date: string }) => b.date),
          );
        }
      } catch {
        // if availability is unreachable, show slots with blocked days included
      }
      const taken = new Set(
        list.filter((b) => b.status !== "declined").map((b) => b.slot),
      );
      setSlots(buildSlots(taken, blocked));
    }
  }, [loadActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function handleBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setStatus({ type: "error", text: "error: pick a slot first." });
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      topic: String(data.get("topic") ?? "").trim(),
      questions: String(data.get("questions") ?? "").trim(),
      slot: selected,
    };
    if (!payload.name || !payload.email || !payload.topic) {
      setStatus({
        type: "error",
        text: "error: name, email, and topic are required.",
      });
      return;
    }

    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setConfirmed(body);
        form.reset();
        setSelected(null);
        await refresh();
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
        text: "error: could not reach /api/bookings. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = manageCode.trim();
    if (!code) {
      setStatus({ type: "error", text: "error: enter your booking code." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/bookings?code=${encodeURIComponent(code)}`,
      );
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setManaged(body);
        setRescheduling(false);
      } else {
        setManaged(null);
        setStatus({
          type: "error",
          text: body?.error ?? "error: could not find that booking.",
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

  async function handleReschedule(iso: string) {
    if (!managed) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(managed.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: managed.code, slot: iso }),
        },
      );
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setManaged(body);
        setRescheduling(false);
        setStatus({ type: "success", text: "✔ meeting rescheduled." });
        await refresh();
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
        text: "error: could not reach /api/bookings. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!managed) return;
    if (!window.confirm("cancel this meeting? this cannot be undone.")) return;
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(managed.id)}?code=${encodeURIComponent(managed.code)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setStatus({ type: "success", text: "✔ meeting cancelled." });
        setManaged(null);
        setManageCode("");
        await refresh();
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

  return (
    <div className="space-y-8">
      <StatusBanner status={status} />

      <div>
        <p className={stepLabel}>step 1 · pick a time</p>
        <div className="mt-3">
          <SlotList
            slots={slots}
            selected={selected}
            onSelect={(iso) => {
              setSelected(iso);
              setConfirmed(null);
            }}
          />
        </div>
      </div>

      {selected && (
        <div>
          <p className={stepLabel}>step 2 · your details</p>
          <div className="mt-3 rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
              <span className="text-accent-bright">
                {new Date(selected).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-foreground/60 transition-colors hover:text-foreground"
              >
                change
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="meet-name" className="mb-1.5 block text-xs text-foreground/60">
                    name:
                  </label>
                  <input
                    id="meet-name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="meet-email" className="mb-1.5 block text-xs text-foreground/60">
                    email:
                  </label>
                  <input
                    id="meet-email"
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    className={inputClasses}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="meet-company" className="mb-1.5 block text-xs text-foreground/60">
                  company / role <span className="text-foreground/40">(optional)</span>:
                </label>
                <input
                  id="meet-company"
                  name="company"
                  type="text"
                  maxLength={120}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="meet-topic" className="mb-1.5 block text-xs text-foreground/60">
                  what should we talk about?
                </label>
                <textarea
                  id="meet-topic"
                  name="topic"
                  required
                  maxLength={300}
                  rows={2}
                  placeholder="roles, my projects, your team..."
                  className={`${inputClasses} resize-y`}
                />
              </div>
              <div>
                <label htmlFor="meet-questions" className="mb-1.5 block text-xs text-foreground/60">
                  questions to bring <span className="text-foreground/40">(optional — prefilled from your notepad)</span>:
                </label>
                <textarea
                  id="meet-questions"
                  name="questions"
                  maxLength={1000}
                  rows={3}
                  defaultValue={notepadDraft}
                  placeholder="- ask about Tokenly"
                  className={`${inputClasses} resize-y`}
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "sending…" : "request meeting"}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5">
          <p className="text-sm text-accent-bright">
            ✔ requested — {new Date(confirmed.slot).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            save this code — it&apos;s how you reschedule or cancel:
          </p>
          <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-accent-bright">
            {confirmed.code}
          </p>
          <button
            type="button"
            onClick={() =>
              downloadIcs({
                id: confirmed.id,
                slot: confirmed.slot,
                topic: confirmed.topic,
                code: confirmed.code,
              })
            }
            className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20"
          >
            download calendar invite (.ics)
          </button>
        </div>
      )}

      <details className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
        <summary className="cursor-pointer text-sm text-foreground/60 transition-colors hover:text-foreground">
          already booked? manage or cancel your meeting
        </summary>
        <div className="mt-4">
          <form onSubmit={handleLookup} className="flex gap-2" noValidate>
            <input
              type="text"
              value={manageCode}
              onChange={(e) => setManageCode(e.target.value)}
              placeholder="booking code"
              className={inputClasses}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              find
            </button>
          </form>

          {managed && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-accent-bright">{managed.topic}</p>
              <p className="text-foreground/60">
                {new Date(managed.slot).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}{" "}
                · status: {managed.status}
              </p>
              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setRescheduling(!rescheduling)}
                  disabled={busy}
                  className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                >
                  [ reschedule ]
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy}
                  className="text-highlight transition-colors hover:opacity-80 disabled:opacity-50"
                >
                  [ cancel ]
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadIcs({
                      id: managed.id,
                      slot: managed.slot,
                      topic: managed.topic,
                      code: managed.code,
                    })
                  }
                  className="text-accent-bright transition-colors hover:text-accent"
                >
                  [ .ics ]
                </button>
              </div>
              {rescheduling && (
                <div className="pt-2">
                  <SlotList slots={slots} onSelect={handleReschedule} />
                </div>
              )}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
