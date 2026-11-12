"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blogs";

type Status = { type: "error"; text: string } | null;

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/blogs");
        const body = await response.json().catch(() => null);

        if (cancelled) return;

        if (response.ok && Array.isArray(body)) {
          setPosts(body);
        } else {
          setStatus({
            type: "error",
            text: "error: could not load blog posts.",
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({
            type: "error",
            text: "error: could not reach /api/blogs. is the server running?",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-foreground/50">loading…</p>
    );
  }

  if (status) {
    return (
      <p className="rounded-lg border border-highlight/40 bg-highlight/10 px-3 py-2 text-sm text-highlight">
        {status.text}
      </p>
    );
  }

  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        no posts yet — publish one from{" "}
        <Link href="/admin/blogs" className="text-accent-bright hover:underline">
          /admin/blogs
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((post) => (
        <Link
          key={post.id}
          href={`/blogs/${post.id}`}
          className="block rounded-lg border border-accent/20 bg-black/30 p-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-foreground transition-colors hover:text-accent-bright">
              {post.title}
              <span className="text-accent">/</span>
            </span>
            <span className="text-xs text-highlight">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-foreground/70">
            {post.body}
          </p>
        </Link>
      ))}
    </div>
  );
}
