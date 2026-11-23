"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
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
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
