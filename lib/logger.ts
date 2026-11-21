import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { NextResponse } from "next/server";

export type ApiLogEntry = {
  ts: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
};

const logPath = path.join(process.cwd(), "data", "logs.json");

async function appendToLog(entry: ApiLogEntry): Promise<void> {
  console.log(
    `[api] ${entry.ts} ${entry.method} ${entry.path} -> ${entry.status} (${entry.durationMs}ms)`,
  );
  try {
    await mkdir(path.dirname(logPath), { recursive: true });
    await appendFile(logPath, JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // read-only filesystem (serverless) — console log still captures it
  }
}

export async function respond(
  request: Request,
  response: NextResponse,
  startedAt: number,
): Promise<NextResponse> {
  const { pathname } = new URL(request.url);
  await appendToLog({
    ts: new Date().toISOString(),
    method: request.method,
    path: pathname,
    status: response.status,
    durationMs: Date.now() - startedAt,
  });
  return response;
}

export async function readApiLogs(limit = 200): Promise<ApiLogEntry[]> {
  try {
    const raw = await readFile(logPath, "utf8");
    const entries: ApiLogEntry[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line) as ApiLogEntry);
      } catch {
        // skip corrupt lines — logs must never break the app
      }
    }
    return entries.slice(-limit);
  } catch {
    return [];
  }
}
