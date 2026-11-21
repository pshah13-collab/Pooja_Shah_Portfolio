import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BlockedDay = { date: string; note?: string };

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "availability.json");

export async function readAvailability(): Promise<BlockedDay[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addBlockedDay(
  date: string,
  note?: string,
): Promise<BlockedDay> {
  const availability = await readAvailability();
  const existing = availability.find((b) => b.date === date);
  if (existing) return existing;

  const blocked: BlockedDay = { date, ...(note ? { note } : {}) };
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify([...availability, blocked], null, 2) + "\n",
    "utf8",
  );
  return blocked;
}

export async function updateBlockedDay(
  date: string,
  patch: { date?: string; note?: string | null },
): Promise<BlockedDay | undefined> {
  const availability = await readAvailability();
  const index = availability.findIndex((b) => b.date === date);
  if (index === -1) return undefined;

  const existing = availability[index];
  const updated: BlockedDay = { date: patch.date ?? existing.date };

  const note =
    patch.note === undefined
      ? existing.note
      : patch.note && patch.note.trim()
        ? patch.note.trim()
        : undefined;
  if (note) updated.note = note;

  availability[index] = updated;
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(availability, null, 2) + "\n",
    "utf8",
  );
  return updated;
}

export async function removeBlockedDay(date: string): Promise<boolean> {
  const availability = await readAvailability();
  const remaining = availability.filter((b) => b.date !== date);
  if (remaining.length === availability.length) return false;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(remaining, null, 2) + "\n",
    "utf8",
  );
  return true;
}
