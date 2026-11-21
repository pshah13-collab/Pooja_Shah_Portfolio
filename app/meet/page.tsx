import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { MeetNotepad } from "@/components/meet-notepad";
import { MeetScheduler } from "@/components/meet-scheduler";
import { readAvailability } from "@/lib/availability";
import { readBookings } from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Meet Pooja",
};

async function MeetSection() {
  const [bookings, availability] = await Promise.all([
    readBookings(),
    readAvailability(),
  ]);

  return (
    <MeetScheduler
      initialBookings={bookings}
      initialAvailability={availability}
    />
  );
}

export default function MeetPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>cal /meet</Cmd>
      <p className="text-xl sm:text-2xl">Coffee chat with Pooja</p>
      <p className="mt-3 text-sm text-foreground/60 sm:text-base">
        15 minutes, video call. Pick a time, tell me what you want to talk
        about — you&apos;ll get a code to reschedule or cancel anytime.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <MeetSection />
        </Suspense>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-xs tracking-widest text-accent uppercase">
          bring your questions
        </p>
        <MeetNotepad />
      </div>

      <p className="mt-10 text-sm">
        <Link
          href="/"
          className="text-foreground/60 transition-colors hover:text-accent-bright"
        >
          <span className="text-accent">pooja@scu:~$</span> cd ~
        </Link>
      </p>
    </section>
  );
}
