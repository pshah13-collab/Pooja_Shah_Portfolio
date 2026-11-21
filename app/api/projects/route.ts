import { NextResponse } from "next/server";
import {
  appendProject,
  readProjects,
  type Project,
} from "@/lib/projects";

const MAX_TITLE = 80;
const MAX_TAGLINE = 120;
const MAX_DATE = 40;
const MAX_DESCRIPTION = 1000;
const MAX_STACK_ITEMS = 8;
const MAX_STACK_ITEM = 40;
const MAX_HIGHLIGHTS = 8;
const MAX_HIGHLIGHT = 300;

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

function cleanStringList(
  value: unknown,
  label: string,
  maxItems: number,
  maxItemLength: number,
): { ok: true; items: string[] } | { ok: false; error: string } {
  let raw: string[];
  if (Array.isArray(value)) {
    raw = value;
  } else if (typeof value === "string" && value.trim()) {
    raw = value.split(value.includes("\n") ? "\n" : ",");
  } else {
    return { ok: false, error: `error: ${label} is required.` };
  }

  const items = raw
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
  if (items.length === 0) {
    return { ok: false, error: `error: ${label} is required.` };
  }
  if (items.length > maxItems) {
    return {
      ok: false,
      error: `error: ${label} must have at most ${maxItems} entries.`,
    };
  }
  if (items.some((item) => item.length > maxItemLength)) {
    return {
      ok: false,
      error: `error: each ${label} entry must be at most ${maxItemLength} characters.`,
    };
  }
  return { ok: true, items };
}

export async function GET() {
  const projects = await readProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "error: expected a JSON project object." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "error: expected a JSON project object." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;

  const title = cleanField(fields.title, "title", MAX_TITLE);
  if (!title.ok) {
    return NextResponse.json({ error: title.error }, { status: 400 });
  }

  const tagline = cleanField(fields.tagline, "tagline", MAX_TAGLINE);
  if (!tagline.ok) {
    return NextResponse.json({ error: tagline.error }, { status: 400 });
  }

  const date = cleanField(fields.date, "date", MAX_DATE);
  if (!date.ok) {
    return NextResponse.json({ error: date.error }, { status: 400 });
  }

  const description = cleanField(
    fields.description,
    "description",
    MAX_DESCRIPTION,
  );
  if (!description.ok) {
    return NextResponse.json({ error: description.error }, { status: 400 });
  }

  const stack = cleanStringList(
    fields.stack,
    "stack",
    MAX_STACK_ITEMS,
    MAX_STACK_ITEM,
  );
  if (!stack.ok) {
    return NextResponse.json({ error: stack.error }, { status: 400 });
  }

  const highlights = cleanStringList(
    fields.highlights,
    "highlights",
    MAX_HIGHLIGHTS,
    MAX_HIGHLIGHT,
  );
  if (!highlights.ok) {
    return NextResponse.json({ error: highlights.error }, { status: 400 });
  }

  const newProject: Omit<Project, "slug"> & { slug?: string } = {
    title: title.text,
    tagline: tagline.text,
    date: date.text,
    description: description.text,
    stack: stack.items,
    highlights: highlights.items,
  };
  if (typeof fields.slug === "string" && fields.slug.trim()) {
    newProject.slug = fields.slug;
  }

  let project;
  try {
    project = await appendProject(newProject);
  } catch {
    return NextResponse.json(
      {
        error:
          "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(project, { status: 201 });
}
