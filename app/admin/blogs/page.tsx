import type { Metadata } from "next";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { BlogManager } from "@/components/blog-manager";
import { readBlogs } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blog Admin",
};

async function BlogAdminSection() {
  const initialPosts = await readBlogs();
  return <BlogManager initialPosts={initialPosts} />;
}

export default function BlogAdminPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl -X POST /api/blogs --data @post.json</Cmd>
      <p className="text-sm text-foreground/60 sm:text-base">
        admin area — new posts are sent as JSON to{" "}
        <span className="text-accent-bright">POST /api/blogs</span>, and the API
        stores them in <span className="text-highlight">data/blogs.json</span>.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <BlogAdminSection />
        </Suspense>
      </div>
    </section>
  );
}
