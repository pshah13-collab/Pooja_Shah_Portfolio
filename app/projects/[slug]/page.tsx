import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project ? project.title : "Project Not Found" };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="mb-3 text-sm">
        <span className="text-accent">pooja@scu:~$</span>{" "}
        <span className="text-foreground/60">
          cat projects/{project.slug}.md
        </span>
      </p>

      <h1 className="text-xl sm:text-2xl">{project.title}</h1>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-sm text-foreground/70">{project.tagline}</p>
        <span className="text-xs text-highlight">{project.date}</span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-foreground/75 sm:text-base">
        {project.description}
      </p>

      <div className="mt-8">
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">cat highlights.txt</span>
        </p>
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
        <p className="mb-3 text-sm">
          <span className="text-accent">pooja@scu:~$</span>{" "}
          <span className="text-foreground/60">ls stack/</span>
        </p>
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
    </section>
  );
}
