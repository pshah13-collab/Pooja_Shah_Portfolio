import { NextResponse } from "next/server";
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

  if (!isValidDate(date)) {
    return NextResponse.json(
      { error: "error: date must be a valid YYYY-MM-DD day." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "error: expected a JSON object with fields to update." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "error: expected a JSON object with fields to update." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;
  const patch: { date?: string; note?: string | null } = {};

  if (fields.date !== undefined) {
    const newDate = typeof fields.date === "string" ? fields.date.trim() : "";
    if (!isValidDate(newDate)) {
      return NextResponse.json(
        { error: "error: date must be a valid YYYY-MM-DD day." },
        { status: 400 },
      );
    }
    if (newDate !== date) {
      const availability = await readAvailability();
      if (availability.some((b) => b.date === newDate)) {
        return NextResponse.json(
          { error: `error: ${newDate} is already blocked.` },
          { status: 409 },
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
        return NextResponse.json(
          { error: `error: note must be at most ${MAX_NOTE} characters.` },
          { status: 400 },
        );
      }
      patch.note = fields.note;
    } else {
      return NextResponse.json(
        { error: "error: note must be text." },
        { status: 400 },
      );
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "error: nothing to update." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateBlockedDay(date, patch);
    if (!updated) {
      return NextResponse.json(
        { error: `error: ${date} is not blocked.` },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    );
  }
}
