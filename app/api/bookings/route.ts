import { NextResponse } from "next/server";
import {
  appendBooking,
  getBookingByCode,
  isSlotTaken,
  readBookings,
} from "@/lib/bookings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_TOPIC = 300;
const MAX_COMPANY = 120;

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

function publicBooking(booking: {
  id: string;
  name: string;
  email: string;
  company?: string;
  topic: string;
  slot: string;
  status: string;
  createdAt: string;
}) {
  return {
    id: booking.id,
    name: booking.name,
    company: booking.company,
    topic: booking.topic,
    slot: booking.slot,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const booking = await getBookingByCode(code);
    if (!booking) {
      return NextResponse.json(
        { error: "error: no booking found for that code." },
        { status: 404 },
      );
    }
    return NextResponse.json(booking);
  }

  const bookings = await readBookings();
  return NextResponse.json(bookings.map(publicBooking));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, topic, and slot fields.",
      },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, topic, and slot fields.",
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

  const topic = cleanField(fields.topic, "topic", MAX_TOPIC);
  if (!topic.ok) {
    return NextResponse.json({ error: topic.error }, { status: 400 });
  }

  let company: string | undefined;
  if (fields.company !== undefined && fields.company !== null) {
    if (typeof fields.company !== "string") {
      return NextResponse.json(
        { error: "error: company must be text." },
        { status: 400 },
      );
    }
    const value = fields.company.trim();
    if (value.length > MAX_COMPANY) {
      return NextResponse.json(
        { error: `error: company must be at most ${MAX_COMPANY} characters.` },
        { status: 400 },
      );
    }
    company = value || undefined;
  }

  const slot =
    typeof fields.slot === "string" ? fields.slot.trim() : "";
  const slotTime = new Date(slot);
  if (!slot || Number.isNaN(slotTime.getTime()) || slotTime.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "error: slot must be a valid future datetime (ISO 8601)." },
      { status: 400 },
    );
  }

  try {
    if (await isSlotTaken(slot)) {
      return NextResponse.json(
        { error: "error: that slot was just booked — pick another one." },
        { status: 409 },
      );
    }

    const booking = await appendBooking({
      name: name.text,
      email: email.text,
      company,
      topic: topic.text,
      slot,
    });
    return NextResponse.json(booking, { status: 201 });
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
