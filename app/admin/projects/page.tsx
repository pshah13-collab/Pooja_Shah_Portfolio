import type { Metadata } from "next";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { ProjectManager } from "@/components/project-manager";
import { readProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects Admin",
};

async function ProjectAdminSection() {
  const initialProjects = await readProjects();
  return <ProjectManager initialProjects={initialProjects} />;
}

export default function ProjectAdminPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl -X POST /api/projects --data @project.json</Cmd>
      <p className="text-sm text-foreground/60 sm:text-base">
        admin area — projects are sent as JSON to{" "}
        <span className="text-accent-bright">/api/projects</span>, and the API
        stores them in <span className="text-highlight">data/projects.json</span>.
        create, edit, or remove.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <ProjectAdminSection />
        </Suspense>
      </div>
    </section>
  );
}
