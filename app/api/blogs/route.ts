import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import { appendBlog, readBlogs } from "@/lib/blogs";

const MAX_TITLE = 150;
const MAX_BODY = 10000;

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
      { error: "error: expected a JSON body with title and body fields." },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON body with title and body fields." },
      { status: 400 },
    ), startedAt);
  }

  const fields = body as Record<string, unknown>;

  const title = cleanField(fields.title, "title", MAX_TITLE);
  if (!title.ok) {
    return respond(request, NextResponse.json({ error: title.error }, { status: 400 }), startedAt);
  }

  const content = cleanField(fields.body, "body", MAX_BODY);
  if (!content.ok) {
    return respond(request, NextResponse.json({ error: content.error }, { status: 400 }), startedAt);
  }

  let post;
  try {
    post = await appendBlog({ title: title.text, body: content.text });
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    ), startedAt);
  }

  return respond(request, NextResponse.json(post, { status: 201 }), startedAt);
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const posts = await readBlogs();
  return respond(request, NextResponse.json(posts), startedAt);
}
