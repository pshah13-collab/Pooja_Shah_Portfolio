import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Submission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  status?: "new" | "responded";
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "submissions.json");

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendSubmission(
  input: Omit<Submission, "id" | "submittedAt">,
): Promise<Submission> {
  const submission: Submission = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...input,
  };

  const submissions = await readSubmissions();
  submissions.push(submission);

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(submissions, null, 2) + "\n",
    "utf8",
  );

  return submission;
}

export async function updateSubmission(
  id: string,
  patch: Partial<Pick<Submission, "status">>,
): Promise<Submission | undefined> {
  const submissions = await readSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  const updated: Submission = { ...submissions[index], ...patch, id };
  submissions[index] = updated;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(submissions, null, 2) + "\n",
    "utf8",
  );

  return updated;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const submissions = await readSubmissions();
  const remaining = submissions.filter((s) => s.id !== id);
  if (remaining.length === submissions.length) return false;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(remaining, null, 2) + "\n",
    "utf8",
  );

  return true;
}
