import Link from "next/link";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
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
  );
}
