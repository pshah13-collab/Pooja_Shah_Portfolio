import { NextResponse } from "next/server";
import { appendSubmission } from "@/lib/submissions";

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, and message fields.",
      },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, and message fields.",
      },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;

  const name = cleanField(fields.name, "name", MAX_NAME);
  if (!name.ok) {
    return NextResponse.json({ error: name.error }, { status: 400 });
  }

  const email = cleanField(fields.email, "email", MAX_EMAIL);
  if (!email.ok) {
    return NextResponse.json({ error: email.error }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.text)) {
    return NextResponse.json(
      { error: "error: please enter a valid email address." },
      { status: 400 },
    );
  }

  const message = cleanField(fields.message, "message", MAX_MESSAGE);
  if (!message.ok) {
    return NextResponse.json({ error: message.error }, { status: 400 });
  }

  const submission = await appendSubmission({
    name: name.text,
    email: email.text,
    message: message.text,
  });

  return NextResponse.json(submission, { status: 201 });
}
