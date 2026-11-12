import { NextResponse } from "next/server";
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "error: expected a JSON body with title and body fields." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "error: expected a JSON body with title and body fields." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;

  const title = cleanField(fields.title, "title", MAX_TITLE);
  if (!title.ok) {
    return NextResponse.json({ error: title.error }, { status: 400 });
  }

  const content = cleanField(fields.body, "body", MAX_BODY);
  if (!content.ok) {
    return NextResponse.json({ error: content.error }, { status: 400 });
  }

  let post;
  try {
    post = await appendBlog({ title: title.text, body: content.text });
  } catch {
    return NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(post, { status: 201 });
}

export async function GET() {
  const posts = await readBlogs();
  return NextResponse.json(posts);
}
