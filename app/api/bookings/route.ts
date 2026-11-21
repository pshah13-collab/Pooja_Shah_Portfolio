import { NextResponse } from "next/server";
import { respond } from "@/lib/logger";
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
const MAX_QUESTIONS = 1000;

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
  questions?: string;
  slot: string;
  status: string;
  createdAt: string;
}) {
  return {
    id: booking.id,
    name: booking.name,
    company: booking.company,
    topic: booking.topic,
    questions: booking.questions,
    slot: booking.slot,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const booking = await getBookingByCode(code);
    if (!booking) {
      return respond(request, NextResponse.json(
        { error: "error: no booking found for that code." },
        { status: 404 },
      ), startedAt);
    }
    return respond(request, NextResponse.json(booking), startedAt);
  }

  const bookings = await readBookings();
  return respond(request, NextResponse.json(bookings.map(publicBooking)), startedAt);
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(request, NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, topic, and slot fields.",
      },
      { status: 400 },
    ), startedAt);
  }

  if (typeof body !== "object" || body === null) {
    return respond(request, NextResponse.json(
      {
        error:
          "error: expected a JSON body with name, email, topic, and slot fields.",
      },
      { status: 400 },
    ), startedAt);
  }

  const fields = body as Record<string, unknown>;

  const name = cleanField(fields.name, "name", MAX_NAME);
  if (!name.ok) {
    return respond(request, NextResponse.json({ error: name.error }, { status: 400 }), startedAt);
  }

  const email = cleanField(fields.email, "email", MAX_EMAIL);
  if (!email.ok) {
    return respond(request, NextResponse.json({ error: email.error }, { status: 400 }), startedAt);
  }
  if (!EMAIL_RE.test(email.text)) {
    return respond(request, NextResponse.json(
      { error: "error: please enter a valid email address." },
      { status: 400 },
    ), startedAt);
  }

  const topic = cleanField(fields.topic, "topic", MAX_TOPIC);
  if (!topic.ok) {
    return respond(request, NextResponse.json({ error: topic.error }, { status: 400 }), startedAt);
  }

  let company: string | undefined;
  if (fields.company !== undefined && fields.company !== null) {
    if (typeof fields.company !== "string") {
      return respond(request, NextResponse.json(
        { error: "error: company must be text." },
        { status: 400 },
      ), startedAt);
    }
    const value = fields.company.trim();
    if (value.length > MAX_COMPANY) {
      return respond(request, NextResponse.json(
        { error: `error: company must be at most ${MAX_COMPANY} characters.` },
        { status: 400 },
      ), startedAt);
    }
    company = value || undefined;
  }

  let questions: string | undefined;
  if (fields.questions !== undefined && fields.questions !== null) {
    if (typeof fields.questions !== "string") {
      return respond(request, NextResponse.json(
        { error: "error: questions must be text." },
        { status: 400 },
      ), startedAt);
    }
    const value = fields.questions.trim();
    if (value.length > MAX_QUESTIONS) {
      return respond(request, NextResponse.json(
        {
          error: `error: questions must be at most ${MAX_QUESTIONS} characters.`,
        },
        { status: 400 },
      ), startedAt);
    }
    questions = value || undefined;
  }

  const slot =
    typeof fields.slot === "string" ? fields.slot.trim() : "";
  const slotTime = new Date(slot);
  if (!slot || Number.isNaN(slotTime.getTime()) || slotTime.getTime() <= Date.now()) {
    return respond(request, NextResponse.json(
      { error: "error: slot must be a valid future datetime (ISO 8601)." },
      { status: 400 },
    ), startedAt);
  }

  try {
    if (await isSlotTaken(slot)) {
      return respond(request, NextResponse.json(
        { error: "error: that slot was just booked — pick another one." },
        { status: 409 },
      ), startedAt);
    }

    const booking = await appendBooking({
      name: name.text,
      email: email.text,
      company,
      topic: topic.text,
      questions,
      slot,
    });
    return respond(request, NextResponse.json(booking, { status: 201 }), startedAt);
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
