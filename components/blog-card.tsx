import Link from "next/link";
import type { BlogPost } from "@/lib/blogs";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
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
  );
}
