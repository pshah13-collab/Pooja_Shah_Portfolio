import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Submission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
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
