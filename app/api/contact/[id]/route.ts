import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
import { deleteSubmission, readSubmissions, updateSubmission } from "@/lib/submissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { id } = await params;
  const submissions = await readSubmissions();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) {
    return respond(_request, NextResponse.json(
      { error: `error: no submission with id ${id}.` },
      { status: 404 },
    ), startedAt);
  }
  return respond(_request, NextResponse.json(submission), startedAt);
}

export async function PUT(request: Request, { params }: Params) {
  const startedAt = Date.now();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON object with a status field." },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      { error: "error: expected a JSON object with a status field." },
      { status: 400 },
    ), startedAt);
  }

  const status = (body as Record<string, unknown>).status;
  if (status !== "new" && status !== "responded") {
    return respond(request, NextResponse.json(
      { error: 'error: status must be "new" or "responded".' },
      { status: 400 },
    ), startedAt);
  }

  try {
    const updated = await updateSubmission(id, { status });
    if (!updated) {
      return respond(request, NextResponse.json(
        { error: `error: no submission with id ${id}.` },
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
    const removed = await deleteSubmission(id);
    if (!removed) {
      return respond(_request, NextResponse.json(
        { error: `error: no submission with id ${id}.` },
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
