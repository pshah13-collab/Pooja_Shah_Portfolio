"use client";

import { useCallback, useState } from "react";
import type { Project } from "@/lib/projects";
import { inputClasses } from "@/lib/ui";
import { StatusBanner } from "@/components/status-banner";

type Status = { type: "success" | "error"; text: string } | null;

const emptyForm = {
  title: "",
  tagline: "",
  date: "",
  stack: "",
  description: "",
  highlights: "",
};

export function ProjectManager({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        setProjects(body);
      } else {
        setStatus({
          type: "error",
          text: "error: could not load projects.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/projects. is the server running?",
      });
    }
  }, []);

  function startEdit(project: Project) {
    setEditing(project.slug);
    setForm({
      title: project.title,
      tagline: project.tagline,
      date: project.date,
      stack: project.stack.join(", "),
      description: project.description,
      highlights: project.highlights.join("\n"),
    });
    setStatus(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      date: form.date.trim(),
      stack: form.stack,
      description: form.description.trim(),
      highlights: form.highlights,
    };

    if (!payload.title || !payload.tagline || !payload.date) {
      setStatus({
        type: "error",
        text: "error: title, tagline, and date are required.",
      });
      return;
    }

    setBusy(true);
    setStatus(null);

    try {
      const response = await fetch(
        editing
          ? `/api/projects/${encodeURIComponent(editing)}`
          : "/api/projects",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => null);

      if (response.ok) {
        setStatus({
          type: "success",
          text: editing
            ? `✔ project updated: ${body?.slug ?? editing}.`
            : `✔ project saved to /api/projects — slug ${body?.slug ?? "(unknown)"}.`,
        });
        cancelEdit();
        await loadProjects();
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
        text: "error: could not reach /api/projects. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm(`rm project ${slug}? this cannot be undone.`)) return;

    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(slug)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setStatus({ type: "success", text: `✔ removed project ${slug}.` });
        if (editing === slug) cancelEdit();
        await loadProjects();
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
        text: "error: could not reach /api/projects. is the server running?",
      });
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...projects].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">
            {editing ? `nano projects/${editing}.md` : "nano new-project.md"}
          </span>
        </p>
        <StatusBanner status={status} />
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-4 rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="project-title" className="mb-1.5 block text-xs text-foreground/60">
                title:
              </label>
              <input
                id="project-title"
                type="text"
                required
                maxLength={80}
                placeholder="Project title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="project-date" className="mb-1.5 block text-xs text-foreground/60">
                date:
              </label>
              <input
                id="project-date"
                type="text"
                required
                maxLength={40}
                placeholder="May 2026"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label htmlFor="project-tagline" className="mb-1.5 block text-xs text-foreground/60">
              tagline:
            </label>
            <input
              id="project-tagline"
              type="text"
              required
              maxLength={120}
              placeholder="One-line description"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="project-stack" className="mb-1.5 block text-xs text-foreground/60">
              stack (comma separated):
            </label>
            <input
              id="project-stack"
              type="text"
              required
              placeholder="Python, SQL, Tableau"
              value={form.stack}
              onChange={(e) => setForm({ ...form, stack: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="project-description" className="mb-1.5 block text-xs text-foreground/60">
              description:
            </label>
            <textarea
              id="project-description"
              required
              maxLength={1000}
              rows={3}
              placeholder="What is this project?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClasses} resize-y font-mono`}
            />
          </div>
          <div>
            <label htmlFor="project-highlights" className="mb-1.5 block text-xs text-foreground/60">
              highlights (one per line):
            </label>
            <textarea
              id="project-highlights"
              required
              rows={4}
              placeholder={"Did the analysis\nShipped the dashboard"}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              className={`${inputClasses} resize-y font-mono`}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-accent" aria-hidden>
                $
              </span>{" "}
              {editing
                ? busy
                  ? "saving…"
                  : "save changes"
                : busy
                  ? "creating…"
                  : "create project"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-accent/20 px-4 py-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
              >
                cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">ls projects/</span>
        </p>
        <div className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
          {sorted.length === 0 ? (
            <p className="text-sm text-foreground/50">no projects yet</p>
          ) : (
            <ul className="space-y-4 text-sm">
              {sorted.map((project) => (
                <li
                  key={project.slug}
                  className="border-b border-accent/10 pb-4 last:border-0 last:pb-0"
                >
                  <p>
                    <span className="text-accent" aria-hidden>
                      -rw-r--r--
                    </span>{" "}
                    <span className="text-accent-bright">{project.title}</span>{" "}
                    <span className="text-xs text-foreground/50">
                      slug: {project.slug}
                    </span>
                  </p>
                  <p className="mt-0.5 text-foreground/60">{project.tagline}</p>
                  <p className="mt-0.5 text-xs text-foreground/35">
                    {project.date} · {project.stack.join(" · ")}
                  </p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      disabled={busy}
                      className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                    >
                      [ edit ]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.slug)}
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
    </div>
  );
}
