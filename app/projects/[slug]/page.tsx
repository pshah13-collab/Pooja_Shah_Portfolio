import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { getProject } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Project",
};

export const instant = false;

type ProjectPageProps = PageProps<"/projects/[slug]">;

async function ProjectView({ slug }: { slug: string }) {
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <Cmd>{`cat projects/${project.slug}.md`}</Cmd>

      <h1 className="text-xl sm:text-2xl">{project.title}</h1>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm text-foreground/70">{project.tagline}</p>
        <span className="text-xs text-highlight">{project.date}</span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-foreground/75 sm:text-base">
        {project.description}
      </p>

      <div className="mt-8">
        <Cmd>cat highlights.txt</Cmd>
        <ul className="space-y-2.5">
          {project.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-2 text-sm leading-relaxed text-foreground/75 sm:text-base"
            >
              <span className="text-accent" aria-hidden>
                ▸
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Cmd>ls stack/</Cmd>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-accent/25 bg-accent/5 px-2 py-0.5 text-xs text-accent-bright"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-10 text-sm">
        <Link
          href="/projects"
          className="text-foreground/60 transition-colors hover:text-accent-bright"
        >
          <span className="text-accent">pooja@scu:~$</span> cd ..
        </Link>
      </p>
    </>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Suspense
        fallback={<p className="text-sm text-foreground/50">loading…</p>}
      >
        <ProjectView slug={slug} />
      </Suspense>
    </section>
  );
}
