import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  date: string;
  stack: string[];
  description: string;
  highlights: string[];
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "projects.json");

export async function readProjects(): Promise<Project[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await readProjects()).find((p) => p.slug === slug);
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

export async function appendProject(
  input: Omit<Project, "slug"> & { slug?: string },
): Promise<Project> {
  const projects = await readProjects();

  const base = slugify(input.slug?.trim() || input.title);
  let slug = base;
  let n = 2;
  while (projects.some((p) => p.slug === slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }

  const project: Project = {
    slug,
    title: input.title,
    tagline: input.tagline,
    date: input.date,
    stack: input.stack,
    description: input.description,
    highlights: input.highlights,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify([...projects, project], null, 2) + "\n",
    "utf8",
  );

  return project;
}

export async function updateProject(
  slug: string,
  patch: Partial<Omit<Project, "slug">>,
): Promise<Project | undefined> {
  const projects = await readProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return undefined;

  const updated: Project = { ...projects[index], ...patch, slug };
  projects[index] = updated;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(projects, null, 2) + "\n",
    "utf8",
  );

  return updated;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const projects = await readProjects();
  const remaining = projects.filter((p) => p.slug !== slug);
  if (remaining.length === projects.length) return false;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(remaining, null, 2) + "\n",
    "utf8",
  );

  return true;
}
