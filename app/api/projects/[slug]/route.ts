import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return respond(_request, NextResponse.json(
      { error: `error: no project with slug ${slug}.` },
      { status: 404 },
    ), startedAt);
  }
  return respond(_request, NextResponse.json(project), startedAt);
}

export async function PUT(request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { slug } = await params;

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
  const patch: Record<string, unknown> = {};

  if (fields.title !== undefined) {
    const value = String(fields.title).trim();
    if (!value || value.length > 80) {
      return respond(request, NextResponse.json(
        { error: "error: title must be 1-80 characters." },
        { status: 400 },
      ), startedAt);
    }
    patch.title = value;
  }
  if (fields.tagline !== undefined) {
    const value = String(fields.tagline).trim();
    if (!value || value.length > 120) {
      return respond(request, NextResponse.json(
        { error: "error: tagline must be 1-120 characters." },
        { status: 400 },
      ), startedAt);
    }
    patch.tagline = value;
  }
  if (fields.date !== undefined) {
    const value = String(fields.date).trim();
    if (!value || value.length > 40) {
      return respond(request, NextResponse.json(
        { error: "error: date must be 1-40 characters." },
        { status: 400 },
      ), startedAt);
    }
    patch.date = value;
  }
  if (fields.description !== undefined) {
    const value = String(fields.description).trim();
    if (!value || value.length > 1000) {
      return respond(request, NextResponse.json(
        { error: "error: description must be 1-1000 characters." },
        { status: 400 },
      ), startedAt);
    }
    patch.description = value;
  }
  if (fields.stack !== undefined) {
    const raw = Array.isArray(fields.stack)
      ? fields.stack
      : String(fields.stack).split(",");
    const items = raw.map((item) => String(item).trim()).filter(Boolean);
    if (items.length === 0 || items.length > 8) {
      return respond(request, NextResponse.json(
        { error: "error: stack must have 1-8 entries." },
        { status: 400 },
      ), startedAt);
    }
    patch.stack = items;
  }
  if (fields.highlights !== undefined) {
    const raw = Array.isArray(fields.highlights)
      ? fields.highlights
      : String(fields.highlights).split("\n");
    const items = raw.map((item) => String(item).trim()).filter(Boolean);
    if (items.length === 0 || items.length > 8) {
      return respond(request, NextResponse.json(
        { error: "error: highlights must have 1-8 entries." },
        { status: 400 },
      ), startedAt);
    }
    patch.highlights = items;
  }

  if (Object.keys(patch).length === 0) {
    return respond(request, NextResponse.json(
      { error: "error: nothing to update." },
      { status: 400 },
    ), startedAt);
  }

  try {
    const updated = await updateProject(slug, patch);
    if (!updated) {
      return respond(request, NextResponse.json(
        { error: `error: no project with slug ${slug}.` },
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
  const { slug } = await params;
  try {
    const removed = await deleteProject(slug);
    if (!removed) {
      return respond(_request, NextResponse.json(
        { error: `error: no project with slug ${slug}.` },
        { status: 404 },
      ), startedAt);
    }
    return respond(_request, NextResponse.json({ ok: true, slug }), startedAt);
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
