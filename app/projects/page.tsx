import type { Metadata } from "next";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { ProjectCard } from "@/components/project-card";
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
        <ProjectCard key={project.slug} project={project} />
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
