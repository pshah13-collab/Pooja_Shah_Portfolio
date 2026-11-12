import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPostView } from "@/components/blog-post-view";

export const metadata: Metadata = {
  title: "Blog Post",
};

export const instant = false;

export default async function BlogPostAliasPage({
  params,
}: PageProps<"/blog-posts/[id]">) {
  const { id } = await params;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Suspense fallback={<p className="text-sm text-foreground/50">loading…</p>}>
        <BlogPostView id={id} />
      </Suspense>
    </section>
  );
}
