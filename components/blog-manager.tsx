"use client";

import { useCallback, useState } from "react";
import type { BlogPost } from "@/lib/blogs";
import { inputClasses } from "@/lib/ui";
import { StatusBanner } from "@/components/status-banner";

type Status = { type: "success" | "error"; text: string } | null;

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [status, setStatus] = useState<Status>(null);
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/blogs");
      const body = await response.json().catch(() => null);
      if (response.ok && Array.isArray(body)) {
        setPosts(body);
      } else {
        setStatus({
          type: "error",
          text: "error: could not load blog posts.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/blogs. is the server running?",
      });
    }
  }, []);

  function startEdit(post: BlogPost) {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
    setStatus(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setBody("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: title.trim(),
      body: body.trim(),
    };

    if (!payload.title || !payload.body) {
      setStatus({ type: "error", text: "error: title and body are required." });
      return;
    }

    setPublishing(true);
    setStatus(null);

    try {
      const response = await fetch(
        editingId
          ? `/api/blogs/${encodeURIComponent(editingId)}`
          : "/api/blogs",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await response.json().catch(() => null);

      if (response.ok) {
        setStatus({
          type: "success",
          text: editingId
            ? "✔ post updated."
            : `✔ post published to /api/blogs — saved with id ${body?.id ?? "(unknown)"}.`,
        });
        cancelEdit();
        await loadPosts();
      } else {
        setStatus({
          type: "error",
          text: body?.error ?? `error: request failed with status ${response.status}.`,
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "error: could not reach /api/blogs. is the server running?",
      });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`rm blog ${id}? this cannot be undone.`)) return;

    setPublishing(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/blogs/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStatus({ type: "success", text: "✔ post removed." });
        if (editingId === id) cancelEdit();
        await loadPosts();
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
        text: "error: could not reach /api/blogs. is the server running?",
      });
    } finally {
      setPublishing(false);
    }
  }

  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">
            {editingId ? `nano blogs/${editingId}.md` : "nano new-post.md"}
          </span>
        </p>
        <StatusBanner status={status} />
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-4 rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5"
          noValidate
        >
          <div>
            <label htmlFor="blog-title" className="mb-1.5 block text-xs text-foreground/60">
              title:
            </label>
            <input
              id="blog-title"
              name="title"
              type="text"
              required
              maxLength={150}
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="blog-body" className="mb-1.5 block text-xs text-foreground/60">
              body:
            </label>
            <textarea
              id="blog-body"
              name="body"
              required
              maxLength={10000}
              rows={8}
              placeholder="Write your blog post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${inputClasses} resize-y font-mono`}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={publishing}
              className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-accent" aria-hidden>
                $
              </span>{" "}
              {editingId
                ? publishing
                  ? "saving…"
                  : "save changes"
                : publishing
                  ? "publishing…"
                  : "publish post"}
            </button>
            {editingId && (
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
          <span className="text-foreground/60">ls blogs/</span>
        </p>
        <div className="rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5">
          {sorted.length === 0 ? (
            <p className="text-sm text-foreground/50">no posts yet</p>
          ) : (
            <ul className="space-y-4 text-sm">
              {sorted.map((post) => (
                <li key={post.id} className="border-b border-accent/10 pb-4 last:border-0 last:pb-0">
                  <p>
                    <span className="text-accent" aria-hidden>
                      -rw-r--r--
                    </span>{" "}
                    <span className="text-foreground/60">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-0.5 text-accent-bright">{post.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-foreground/50">
                    {post.body}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/35">id: {post.id}</p>
                  <div className="mt-2 flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      disabled={publishing}
                      className="text-accent-bright transition-colors hover:text-accent disabled:opacity-50"
                    >
                      [ edit ]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      disabled={publishing}
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
