import { NextResponse } from "next/server";
import { deleteSubmission, readSubmissions, updateSubmission } from "@/lib/submissions";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const submissions = await readSubmissions();
  const submission = submissions.find((s) => s.id === id);
  if (!submission) {
    return NextResponse.json(
      { error: `error: no submission with id ${id}.` },
      { status: 404 },
    );
  }
  return NextResponse.json(submission);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "error: expected a JSON object with a status field." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "error: expected a JSON object with a status field." },
      { status: 400 },
    );
  }

  const status = (body as Record<string, unknown>).status;
  if (status !== "new" && status !== "responded") {
    return NextResponse.json(
      { error: 'error: status must be "new" or "responded".' },
      { status: 400 },
    );
  }

  try {
    const updated = await updateSubmission(id, { status });
    if (!updated) {
      return NextResponse.json(
        { error: `error: no submission with id ${id}.` },
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
  const { id } = await params;
  try {
    const removed = await deleteSubmission(id);
    if (!removed) {
      return NextResponse.json(
        { error: `error: no submission with id ${id}.` },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, id });
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
