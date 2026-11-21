import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import {
  addBlockedDay,
  readAvailability,
  removeBlockedDay,
} from "@/lib/availability";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTE = 120;

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const availability = await readAvailability();
  return respond(request, NextResponse.json(availability), startedAt);
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON body with a date field." },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON body with a date field." },
      { status: 400 },
    ), startedAt);
  }

  const fields = body as Record<string, unknown>;
  const date = typeof fields.date === "string" ? fields.date.trim() : "";

  if (!isValidDate(date)) {
    return respond(request, NextResponse.json(
      { error: "error: date must be a valid YYYY-MM-DD day." },
      { status: 400 },
    ), startedAt);
  }

  let note: string | undefined;
  if (fields.note !== undefined && fields.note !== null) {
    if (typeof fields.note !== "string") {
      return respond(request, NextResponse.json(
        { error: "error: note must be text." },
        { status: 400 },
      ), startedAt);
    }
    const value = fields.note.trim();
    if (value.length > MAX_NOTE) {
      return respond(request, NextResponse.json(
        { error: `error: note must be at most ${MAX_NOTE} characters.` },
        { status: 400 },
      ), startedAt);
    }
    note = value || undefined;
  }

  try {
    const availability = await readAvailability();
    if (availability.some((b) => b.date === date)) {
      return respond(request, NextResponse.json(
        { error: `error: ${date} is already blocked.` },
        { status: 409 },
      ), startedAt);
    }
    const blocked = await addBlockedDay(date, note);
    return respond(request, NextResponse.json(blocked, { status: 201 }), startedAt);
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    ), startedAt);
  }
}

export async function DELETE(request: Request) {
  const startedAt = Date.now();
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isValidDate(date)) {
    return respond(request, NextResponse.json(
      { error: "error: date must be a valid YYYY-MM-DD day." },
      { status: 400 },
    ), startedAt);
  }
  try {
    const removed = await removeBlockedDay(date);
    if (!removed) {
      return respond(request, NextResponse.json(
        { error: `error: ${date} is not blocked.` },
        { status: 404 },
      ), startedAt);
    }
    return respond(request, NextResponse.json({ ok: true, date }), startedAt);
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    ), startedAt);
  }
}
