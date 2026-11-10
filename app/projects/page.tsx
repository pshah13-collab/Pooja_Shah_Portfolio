import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="mb-3 text-sm">
        <span className="text-accent">pooja@scu:~$</span>{" "}
        <span className="text-foreground/60">ls projects/</span>
      </p>
      <p className="text-xl sm:text-2xl">Projects</p>

      <div className="mt-8 space-y-4">
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

      <p className="mt-6 text-sm text-foreground/50">
        each entry opens like a folder — try the Tokenly one
      </p>
    </section>
  );
}
