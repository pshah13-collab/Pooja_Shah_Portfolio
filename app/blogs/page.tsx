import type { Metadata } from "next";
import { Cmd } from "@/components/cmd";
import { BlogList } from "@/components/blog-list";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogsPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl /api/blogs</Cmd>
      <p className="text-xl sm:text-2xl">Blog</p>
      <p className="mt-1 text-sm text-foreground/60 sm:text-base">
        this page loads every post from{" "}
        <span className="text-accent-bright">GET /api/blogs</span> — stored in{" "}
        <span className="text-highlight">data/blogs.json</span>.
      </p>

      <div className="mt-8">
        <BlogList />
      </div>
    </section>
  );
}
