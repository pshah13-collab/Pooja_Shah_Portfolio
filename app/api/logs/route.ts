import { NextResponse } from "next/server";
import { readApiLogs, respond } from "@/lib/logger";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const logs = await readApiLogs();
  return respond(request, NextResponse.json(logs), startedAt);
}
