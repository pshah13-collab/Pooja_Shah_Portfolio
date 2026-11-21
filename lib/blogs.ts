import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BlogPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "blogs.json");

export async function readBlogs(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendBlog(
  input: Omit<BlogPost, "id" | "createdAt">,
): Promise<BlogPost> {
  const post: BlogPost = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };

  const blogs = await readBlogs();
  blogs.push(post);

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(blogs, null, 2) + "\n", "utf8");

  return post;
}

export async function updateBlog(
  id: string,
  patch: Partial<Omit<BlogPost, "id" | "createdAt">>,
): Promise<BlogPost | undefined> {
  const blogs = await readBlogs();
  const index = blogs.findIndex((b) => b.id === id);
  if (index === -1) return undefined;

  const updated: BlogPost = { ...blogs[index], ...patch, id };
  blogs[index] = updated;

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(blogs, null, 2) + "\n", "utf8");

  return updated;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const blogs = await readBlogs();
  const remaining = blogs.filter((b) => b.id !== id);
  if (remaining.length === blogs.length) return false;

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(remaining, null, 2) + "\n", "utf8");

  return true;
}
