import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import { appendSubmission, readSubmissions } from "@/lib/submissions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 2000;

function cleanField(
  value: unknown,
  label: string,
  maxLength: number,
): { ok: true; text: string } | { ok: false; error: string } {
  if (typeof value !== "string") {
    return { ok: false, error: `error: ${label} is required.` };
  }
  const text = value.trim();
  if (!text) {
    return { ok: false, error: `error: ${label} cannot be blank.` };
  }
  if (text.length > maxLength) {
    return {
      ok: false,
      error: `error: ${label} must be at most ${maxLength} characters.`,
    };
  }
  return { ok: true, text };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, and message fields.",
      },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, and message fields.",
      },
      { status: 400 },
    ), startedAt);
  }

  const fields = body as Record<string, unknown>;

  const name = cleanField(fields.name, "name", MAX_NAME);
  if (!name.ok) {
    return respond(request, NextResponse.json({ error: name.error }, { status: 400 }), startedAt);
  }

  const email = cleanField(fields.email, "email", MAX_EMAIL);
  if (!email.ok) {
    return respond(request, NextResponse.json({ error: email.error }, { status: 400 }), startedAt);
  }
  if (!EMAIL_RE.test(email.text)) {
    return respond(request, NextResponse.json(
      { error: "error: please enter a valid email address." },
      { status: 400 },
    ), startedAt);
  }

  const message = cleanField(fields.message, "message", MAX_MESSAGE);
  if (!message.ok) {
    return respond(request, NextResponse.json({ error: message.error }, { status: 400 }), startedAt);
  }

  let submission;
  try {
    submission = await appendSubmission({
      name: name.text,
      email: email.text,
      message: message.text,
    });
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    ), startedAt);
  }

  return respond(request, NextResponse.json(submission, { status: 201 }), startedAt);
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const submissions = await readSubmissions();
  return respond(request, NextResponse.json(submissions), startedAt);
}
