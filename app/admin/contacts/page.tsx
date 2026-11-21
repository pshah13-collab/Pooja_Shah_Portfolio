import type { Metadata } from "next";
import { Suspense } from "react";
import { Cmd } from "@/components/cmd";
import { ContactInbox } from "@/components/contact-inbox";
import { readSubmissions } from "@/lib/submissions";

export const metadata: Metadata = {
  title: "Contact Admin",
};

async function ContactAdminSection() {
  const initialSubmissions = await readSubmissions();
  return <ContactInbox initialSubmissions={initialSubmissions} />;
}

export default function ContactAdminPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl /api/contact</Cmd>
      <p className="text-sm text-foreground/60 sm:text-base">
        admin area — every form submission lands in{" "}
        <span className="text-highlight">data/submissions.json</span> via{" "}
        <span className="text-accent-bright">POST /api/contact</span>. mark them
        responded or remove them.
      </p>

      <div className="mt-10">
        <Suspense
          fallback={<p className="text-sm text-foreground/50">loading…</p>}
        >
          <ContactAdminSection />
        </Suspense>
      </div>
    </section>
  );
}
