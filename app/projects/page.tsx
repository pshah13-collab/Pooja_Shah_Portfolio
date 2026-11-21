import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { readProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

async function ProjectList() {
  const projects = await readProjects();

  if (projects.length === 0) {
    return (
      <p className="text-sm text-foreground/50">
        no projects yet — add them in /admin/projects
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="block rounded-lg border border-accent/20 bg-black/30 p-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-foreground transition-colors hover:text-accent-bright">
              {project.title}
              <span className="text-accent">/</span>
            </span>
            <span className="text-xs text-highlight">{project.date}</span>
          </div>
          <p className="mt-1 text-sm text-foreground/70">{project.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded border border-accent/25 bg-accent/5 px-2 py-0.5 text-xs text-accent-bright"
              >
                {tech}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Projects() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>ls projects/</Cmd>
      <p className="text-xl sm:text-2xl">Projects</p>

      <div className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <ProjectList />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-foreground/50">
        each entry opens like a folder — try the Tokenly one
      </p>
    </section>
  );
}
