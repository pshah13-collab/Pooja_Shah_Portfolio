import type { Metadata } from "next";
import { Cmd } from "@/components/cmd";
import { ContactApiForm } from "@/components/contact-api-form";

export const metadata: Metadata = {
  title: "Contact Me",
};

export default function ContactMePage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>curl -X POST /api/contact --data @message.json</Cmd>
      <p className="text-sm text-foreground/60 sm:text-base">
        this form sends your message as JSON to{" "}
        <span className="text-accent-bright">POST /api/contact</span>, and the
        API stores it in <span className="text-highlight">data/submissions.json</span>.
      </p>

      <div className="mt-10">
        <Cmd>nano message.txt</Cmd>
        <ContactApiForm />
      </div>
    </section>
  );
}
