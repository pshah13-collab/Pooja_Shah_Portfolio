import Link from "next/link";
import { notFound } from "next/navigation";
import { Cmd } from "@/components/cmd";
import { readBlogs, type BlogPost } from "@/lib/blogs";

export async function BlogPostView({ id }: { id: string }) {
  const posts = await readBlogs();
  const post: BlogPost | undefined = posts.find((p) => p.id === id);
  if (!post) notFound();

  const sorted = [...posts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const index = sorted.findIndex((p) => p.id === id);
  const newer = index > 0 ? sorted[index - 1] : null;
  const older = index < sorted.length - 1 ? sorted[index + 1] : null;

  return (
    <>
      <Cmd>{`cat blogs/${post.id}.md`}</Cmd>

      <h1 className="text-xl sm:text-2xl">{post.title}</h1>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm text-foreground/70">
          pooja@scu
        </p>
        <span className="text-xs text-highlight">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/75 sm:text-base">
        {post.body}
      </p>

      <div className="mt-8 flex flex-wrap justify-between gap-3 text-sm">
        {newer ? (
          <Link
            href={`/blogs/${newer.id}`}
            className="min-w-0 transition-colors hover:text-accent-bright"
          >
            <span className="text-foreground/60">cd ../newer · </span>
            <span className="text-highlight">{newer.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {older ? (
          <Link
            href={`/blogs/${older.id}`}
            className="min-w-0 truncate text-right transition-colors hover:text-accent-bright"
          >
            <span className="text-foreground/60">older · </span>
            <span className="text-highlight">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>

      <p className="mt-8 text-sm">
        <Link
          href="/blogs"
          className="text-foreground/60 transition-colors hover:text-accent-bright"
        >
          <span className="text-accent">pooja@scu:~$</span> cd ..
        </Link>
      </p>
    </>
  );
}
