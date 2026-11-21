"use client";

import { useCallback, useState } from "react";
import type { Submission } from "@/lib/submissions";
import { StatusBanner } from "@/components/status-banner";

type Status = { type: "success" | "error"; text: string } | null;

export function ContactInbox({
  initialSubmissions,
}: {
  initialSubmissions: Submission[];
}) {
  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const loadSubmissions = useCallback(async () => {
    try {
      const response = await fetch("/api/contact");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        setSubmissions(body);
      } else {
        setStatus({ type: "error", text: "error: could not load inbox." });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/contact. is the server running?",
      });
    }
  }, []);

  async function setStatusFor(id: string, next: "new" | "responded") {
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/contact/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (response.ok) {
        await loadSubmissions();
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
        text: "error: could not reach /api/contact. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`rm submission ${id}? this cannot be undone.`)) return;

    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/contact/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStatus({ type: "success", text: "✔ submission removed." });
        await loadSubmissions();
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
        text: "error: could not reach /api/contact. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );

  return (
    <div className="space-y-6">
      <StatusBanner status={status} />
      <p className="mb-3 text-sm">
        <span className="text-accent">pooja@scu:~$</span>{" "}
        <span className="text-foreground/60">mailq</span>
      </p>
      <div className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-foreground/50">
            inbox empty — no submissions yet
          </p>
        ) : (
          <ul className="space-y-4 text-sm">
            {sorted.map((submission) => (
              <li
                key={submission.id}
                className="border-b border-accent/10 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p>
                    <span className="text-accent" aria-hidden>
                      -rw-r--r--
                    </span>{" "}
                    <span className="text-accent-bright">
                      {submission.name}
                    </span>{" "}
                    <span className="text-foreground/50">
                      &lt;{submission.email}&gt;
                    </span>
                  </p>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-xs ${
                      submission.status === "responded"
                        ? "border-accent/40 text-accent-bright"
                        : "border-highlight/40 text-highlight"
                    }`}
                  >
                    {submission.status ?? "new"}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-foreground/70">
                  {submission.message}
                </p>
                <p className="mt-0.5 text-xs text-foreground/35">
                  {new Date(submission.submittedAt).toLocaleString()} · id:{" "}
                  {submission.id}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  {submission.status === "responded" ? (
                    <button
                      type="button"
                      onClick={() => setStatusFor(submission.id, "new")}
                      disabled={busy}
                      className="text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      [ mark new ]
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStatusFor(submission.id, "responded")}
                      disabled={busy}
                      className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                    >
                      [ mark responded ]
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(submission.id)}
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
