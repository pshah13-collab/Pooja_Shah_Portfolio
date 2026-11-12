"use client";

import { useState } from "react";

type Status = { type: "success" | "error"; text: string } | null;

const inputClasses =
  "w-full rounded-md border border-accent/25 bg-black/40 px-3 py-2 text-base text-foreground outline-none placeholder:text-foreground/30 focus:border-accent/60";

export function ContactApiForm() {
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus({ type: "error", text: "error: all fields are required." });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);

      if (response.ok) {
        setStatus({
          type: "success",
          text: `✔ message sent to /api/contact — saved with id ${body?.id ?? "(unknown)"}. I'll get back to you soon.`,
        });
        form.reset();
      } else {
        setStatus({
          type: "error",
          text: body?.error ?? `error: request failed with status ${response.status}.`,
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/contact. is the server running?",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
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
      <form
        onSubmit={handleSubmit}
        className="mt-3 space-y-4 rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5"
        noValidate
      >
        <div>
          <label htmlFor="api-name" className="mb-1.5 block text-xs text-foreground/60">
            name:
          </label>
          <input
            id="api-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Your Name"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="api-email" className="mb-1.5 block text-xs text-foreground/60">
            email:
          </label>
          <input
            id="api-email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="api-message" className="mb-1.5 block text-xs text-foreground/60">
            message:
          </label>
          <textarea
            id="api-message"
            name="message"
            required
            maxLength={2000}
            rows={5}
            placeholder="Hi Pooja — ..."
            className={`${inputClasses} resize-y`}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-accent" aria-hidden>
            $
          </span>{" "}
          {sending ? "sending…" : "send message"}
        </button>
      </form>
    </>
  );
}
