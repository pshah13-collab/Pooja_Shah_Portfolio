import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import { deleteBlog, readBlogs, updateBlog } from "@/lib/blogs";

type Params = { params: Promise<{ id: string }> };

const MAX_TITLE = 150;
const MAX_BODY = 10000;

export async function GET(_request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { id } = await params;
  const posts = await readBlogs();
  const post = posts.find((b) => b.id === id);
  if (!post) {
    return respond(_request, NextResponse.json(
      { error: `error: no blog post with id ${id}.` },
      { status: 404 },
    ), startedAt);
  }
  return respond(_request, NextResponse.json(post), startedAt);
}

export async function PUT(request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON object with fields to update." },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON object with fields to update." },
      { status: 400 },
    ), startedAt);
  }

  const fields = body as Record<string, unknown>;
  const patch: Record<string, string> = {};

  if (fields.title !== undefined) {
    const value = String(fields.title).trim();
    if (!value || value.length > MAX_TITLE) {
      return respond(request, NextResponse.json(
        { error: `error: title must be 1-${MAX_TITLE} characters.` },
        { status: 400 },
      ), startedAt);
    }
    patch.title = value;
  }

  if (fields.body !== undefined) {
    const value = String(fields.body).trim();
    if (!value || value.length > MAX_BODY) {
      return respond(request, NextResponse.json(
        { error: `error: body must be 1-${MAX_BODY} characters.` },
        { status: 400 },
      ), startedAt);
    }
    patch.body = value;
  }

  if (Object.keys(patch).length === 0) {
    return respond(request, NextResponse.json(
      { error: "error: nothing to update." },
      { status: 400 },
    ), startedAt);
  }

  try {
    const updated = await updateBlog(id, patch);
    if (!updated) {
      return respond(request, NextResponse.json(
        { error: `error: no blog post with id ${id}.` },
        { status: 404 },
      ), startedAt);
    }
    return respond(request, NextResponse.json(updated), startedAt);
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

export async function DELETE(_request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { id } = await params;
  try {
    const removed = await deleteBlog(id);
    if (!removed) {
      return respond(_request, NextResponse.json(
        { error: `error: no blog post with id ${id}.` },
        { status: 404 },
      ), startedAt);
    }
    return respond(_request, NextResponse.json({ ok: true, id }), startedAt);
  } catch {
    return respond(_request, NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    ), startedAt);
  }
}
