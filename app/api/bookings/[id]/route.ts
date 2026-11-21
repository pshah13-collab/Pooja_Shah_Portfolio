import { NextResponse } from "next/server";
import {
  deleteBooking,
  isSlotTaken,
  readBookings,
  updateBooking,
  type BookingStatus,
} from "@/lib/bookings";

type Params = { params: Promise<{ id: string }> };

const STATUSES: BookingStatus[] = ["requested", "confirmed", "declined"];

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "error: expected a JSON object with code and/or slot fields." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "error: expected a JSON object with code and/or slot fields." },
      { status: 400 },
    );
  }

  const fields = body as Record<string, unknown>;
  const bookings = await readBookings();
  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return NextResponse.json(
      { error: `error: no booking with id ${id}.` },
      { status: 404 },
    );
  }

  const visitorCode =
    typeof fields.code === "string" ? fields.code.trim() : "";

  if (visitorCode) {
    if (visitorCode.toUpperCase() !== booking.code.toUpperCase()) {
      return NextResponse.json(
        { error: "error: that code does not match this booking." },
        { status: 403 },
      );
    }
  }

  const patch: Record<string, unknown> = {};

  if (fields.slot !== undefined) {
    const slot = typeof fields.slot === "string" ? fields.slot.trim() : "";
    const slotTime = new Date(slot);
    if (!slot || Number.isNaN(slotTime.getTime()) || slotTime.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "error: slot must be a valid future datetime (ISO 8601)." },
        { status: 400 },
      );
    }
    try {
      if (await isSlotTaken(slot, id)) {
        return NextResponse.json(
          { error: "error: that slot was just booked — pick another one." },
          { status: 409 },
        );
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "error: storage is not writable on this deployment (serverless hosts have a read-only filesystem).",
        },
        { status: 500 },
      );
    }
    patch.slot = slot;
  }

  if (fields.status !== undefined) {
    if (visitorCode) {
      return NextResponse.json(
        { error: "error: status can only be changed by the host." },
        { status: 403 },
      );
    }
    if (!STATUSES.includes(fields.status as BookingStatus)) {
      return NextResponse.json(
        {
          error:
            'error: status must be "requested", "confirmed", or "declined".',
        },
        { status: 400 },
      );
    }
    patch.status = fields.status;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "error: nothing to update." },
      { status: 400 },
    );
  }

  try {
    const updated = await updateBooking(id, patch);
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

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const code = new URL(request.url).searchParams.get("code") ?? "";

  const bookings = await readBookings();
  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return NextResponse.json(
      { error: `error: no booking with id ${id}.` },
      { status: 404 },
    );
  }

  if (code && code.toUpperCase() !== booking.code.toUpperCase()) {
    return NextResponse.json(
      { error: "error: that code does not match this booking." },
      { status: 403 },
    );
  }

  try {
    await deleteBooking(id);
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
