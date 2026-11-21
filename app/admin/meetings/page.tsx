import type { Metadata } from "next";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { MeetingManager } from "@/components/meeting-manager";
import { readBookings } from "@/lib/bookings";

export const metadata: Metadata = {
  title: "Meetings Admin",
};

async function MeetingAdminSection() {
  const initialBookings = await readBookings();
  return <MeetingManager initialBookings={initialBookings} />;
}

export default function MeetingAdminPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl /api/bookings</Cmd>
      <p className="text-sm text-foreground/60 sm:text-base">
        admin area — coffee-chat requests land in{" "}
        <span className="text-highlight">data/bookings.json</span> via{" "}
        <span className="text-accent-bright">POST /api/bookings</span>.
        confirm, decline, or remove them.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <MeetingAdminSection />
        </Suspense>
      </div>
    </section>
  );
}
