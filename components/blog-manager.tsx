"use client";

import { useCallback, useState } from "react";
import type { BlogPost } from "@/lib/blogs";

type Status = { type: "success" | "error"; text: string } | null;

const inputClasses =
  "w-full rounded-md border border-accent/25 bg-black/40 px-3 py-2 text-base text-foreground outline-none placeholder:text-foreground/30 focus:border-accent/60";

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [status, setStatus] = useState<Status>(null);
  const [publishing, setPublishing] = useState(false);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      title: String(data.get("title") ?? "").trim(),
      body: String(data.get("body") ?? "").trim(),
    };

    if (!payload.title || !payload.body) {
      setStatus({ type: "error", text: "error: title and body are required." });
      return;
    }

    setPublishing(true);
    setStatus(null);

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);

      if (response.ok) {
        setStatus({
          type: "success",
          text: `✔ post published to /api/blogs — saved with id ${body?.id ?? "(unknown)"}.`,
        });
        form.reset();
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

  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">nano new-post.md</span>
        </p>
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
              className={`${inputClasses} resize-y font-mono`}
            />
          </div>
          <button
            type="submit"
            disabled={publishing}
            className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-accent" aria-hidden>
              $
            </span>{" "}
            {publishing ? "publishing…" : "publish post"}
          </button>
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
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
