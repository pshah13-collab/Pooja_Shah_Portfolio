import { NextResponse } from "next/server";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return NextResponse.json(
      { error: `error: no project with slug ${slug}.` },
      { status: 404 },
    );
  }
  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: Params) {
  const { slug } = await params;

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
  const patch: Record<string, unknown> = {};

  if (fields.title !== undefined) {
    const value = String(fields.title).trim();
    if (!value || value.length > 80) {
      return NextResponse.json(
        { error: "error: title must be 1-80 characters." },
        { status: 400 },
      );
    }
    patch.title = value;
  }
  if (fields.tagline !== undefined) {
    const value = String(fields.tagline).trim();
    if (!value || value.length > 120) {
      return NextResponse.json(
        { error: "error: tagline must be 1-120 characters." },
        { status: 400 },
      );
    }
    patch.tagline = value;
  }
  if (fields.date !== undefined) {
    const value = String(fields.date).trim();
    if (!value || value.length > 40) {
      return NextResponse.json(
        { error: "error: date must be 1-40 characters." },
        { status: 400 },
      );
    }
    patch.date = value;
  }
  if (fields.description !== undefined) {
    const value = String(fields.description).trim();
    if (!value || value.length > 1000) {
      return NextResponse.json(
        { error: "error: description must be 1-1000 characters." },
        { status: 400 },
      );
    }
    patch.description = value;
  }
  if (fields.stack !== undefined) {
    const raw = Array.isArray(fields.stack)
      ? fields.stack
      : String(fields.stack).split(",");
    const items = raw.map((item) => String(item).trim()).filter(Boolean);
    if (items.length === 0 || items.length > 8) {
      return NextResponse.json(
        { error: "error: stack must have 1-8 entries." },
        { status: 400 },
      );
    }
    patch.stack = items;
  }
  if (fields.highlights !== undefined) {
    const raw = Array.isArray(fields.highlights)
      ? fields.highlights
      : String(fields.highlights).split("\n");
    const items = raw.map((item) => String(item).trim()).filter(Boolean);
    if (items.length === 0 || items.length > 8) {
      return NextResponse.json(
        { error: "error: highlights must have 1-8 entries." },
        { status: 400 },
      );
    }
    patch.highlights = items;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "error: nothing to update." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateProject(slug, patch);
    if (!updated) {
      return NextResponse.json(
        { error: `error: no project with slug ${slug}.` },
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

export async function DELETE(_request: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const removed = await deleteProject(slug);
    if (!removed) {
      return NextResponse.json(
        { error: `error: no project with slug ${slug}.` },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, slug });
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
