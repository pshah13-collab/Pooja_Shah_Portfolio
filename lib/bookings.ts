import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BookingStatus = "requested" | "confirmed" | "declined";

export type Booking = {
  id: string;
  name: string;
  email: string;
  company?: string;
  topic: string;
  slot: string;
  code: string;
  status: BookingStatus;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "bookings.json");

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

export async function readBookings(): Promise<Booking[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getBookingByCode(code: string): Promise<Booking | undefined> {
  return (await readBookings()).find(
    (b) => b.code.toUpperCase() === code.toUpperCase(),
  );
}

export async function isSlotTaken(slot: string, ignoreId?: string): Promise<boolean> {
  return (await readBookings()).some(
    (b) =>
      b.slot === slot && b.status !== "declined" && b.id !== ignoreId,
  );
}

export async function appendBooking(
  input: Omit<Booking, "id" | "code" | "status" | "createdAt">,
): Promise<Booking> {
  const booking: Booking = {
    id: crypto.randomUUID(),
    code: generateCode(),
    status: "requested",
    createdAt: new Date().toISOString(),
    ...input,
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify([...(await readBookings()), booking], null, 2) + "\n",
    "utf8",
  );

  return booking;
}

export async function updateBooking(
  id: string,
  patch: Partial<Omit<Booking, "id" | "createdAt">>,
): Promise<Booking | undefined> {
  const bookings = await readBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return undefined;

  const updated: Booking = { ...bookings[index], ...patch, id };
  bookings[index] = updated;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(bookings, null, 2) + "\n",
    "utf8",
  );

  return updated;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const bookings = await readBookings();
  const remaining = bookings.filter((b) => b.id !== id);
  if (remaining.length === bookings.length) return false;

  await mkdir(dataDir, { recursive: true });
  await writeFile(
    filePath,
    JSON.stringify(remaining, null, 2) + "\n",
    "utf8",
  );

  return true;
}
