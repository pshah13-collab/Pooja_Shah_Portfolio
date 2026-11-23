import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import { readAvailability, updateBlockedDay } from "@/lib/availability";

type Params = { params: Promise<{ date: string }> };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTE = 120;

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export async function PUT(request: Request, { params }: Params) {
  const { date } = await params;
  const startedAt = Date.now();

  if (!isValidDate(date)) {
    return respond(
      request,
      NextResponse.json(
        { error: "error: date must be a valid YYYY-MM-DD day." },
        { status: 400 },
      ),
      startedAt,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(
      request,
      NextResponse.json(
        { error: "error: expected a JSON object with fields to update." },
        { status: 400 },
      ),
      startedAt,
    );
  }

  if (typeof body !== "object" || body === null) {
    return respond(
      request,
      NextResponse.json(
        { error: "error: expected a JSON object with fields to update." },
        { status: 400 },
      ),
      startedAt,
    );
  }

  const fields = body as Record<string, unknown>;
  const patch: { date?: string; note?: string | null } = {};

  if (fields.date !== undefined) {
    const newDate = typeof fields.date === "string" ? fields.date.trim() : "";
    if (!isValidDate(newDate)) {
      return respond(
        request,
        NextResponse.json(
          { error: "error: date must be a valid YYYY-MM-DD day." },
          { status: 400 },
        ),
        startedAt,
      );
    }
    if (newDate !== date) {
      const availability = await readAvailability();
      if (availability.some((b) => b.date === newDate)) {
        return respond(
          request,
          NextResponse.json(
            { error: `error: ${newDate} is already blocked.` },
            { status: 409 },
          ),
          startedAt,
        );
      }
    }
    patch.date = newDate;
  }

  if (fields.note !== undefined) {
    if (fields.note === null) {
      patch.note = null;
    } else if (typeof fields.note === "string") {
      if (fields.note.trim().length > MAX_NOTE) {
        return respond(
          request,
          NextResponse.json(
            { error: `error: note must be at most ${MAX_NOTE} characters.` },
            { status: 400 },
          ),
          startedAt,
        );
      }
      patch.note = fields.note;
    } else {
      return respond(
        request,
        NextResponse.json(
          { error: "error: note must be text." },
          { status: 400 },
        ),
        startedAt,
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return respond(
      request,
      NextResponse.json(
        { error: "error: nothing to update." },
        { status: 400 },
      ),
      startedAt,
    );
  }

  try {
    const updated = await updateBlockedDay(date, patch);
    if (!updated) {
      return respond(
        request,
        NextResponse.json(
          { error: `error: ${date} is not blocked.` },
          { status: 404 },
        ),
        startedAt,
      );
    }
    return respond(request, NextResponse.json(updated), startedAt);
  } catch {
    return respond(
      request,
      NextResponse.json(
        {
          error:
            "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
        },
        { status: 500 },
      ),
      startedAt,
    );
  }
}
