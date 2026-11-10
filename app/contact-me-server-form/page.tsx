import type { Metadata } from "next";
import { Suspense } from "react";
import { submitContact } from "@/actions/submit-contact";
import { Cmd } from "@/components/cmd";

export const metadata: Metadata = {
  title: "Contact Me",
};

const EMAIL = "poojadshah1999@gmail.com";
const LINKEDIN_LABEL = "linkedin.com/in/pooja-shah-3559441aa";
const LINKEDIN_URL = "https://linkedin.com/in/pooja-shah-3559441aa";

const ERROR_MESSAGES: Record<string, string> = {
  required: "error: all fields are required.",
  email: "error: please enter a valid email address.",
};

const inputClasses =
  "w-full rounded-md border border-accent/25 bg-black/40 px-3 py-2 text-base text-foreground outline-none placeholder:text-foreground/30 focus:border-accent/60";

async function ContactFormSection({
  searchParams,
}: {
  searchParams: Awaited<PageProps<"/contact-me-server-form">>["searchParams"];
}) {
  const sp = await searchParams;
  const name = typeof sp.name === "string" ? sp.name : "";
  const email = typeof sp.email === "string" ? sp.email : "";
  const error =
    typeof sp.error === "string" ? ERROR_MESSAGES[sp.error] : undefined;

  return (
    <>
      {sp.submitted && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent-bright">
          ✔ message saved to data/submissions.json — I&apos;ll get back to you
          soon.
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-highlight/40 bg-highlight/10 px-3 py-2 text-sm text-highlight">
          {error}
        </p>
      )}
      <form
        action={submitContact}
        className="mt-3 space-y-4 rounded-lg border border-accent/20 bg-black/30 p-4 sm:p-5"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs text-foreground/60"
          >
            name:
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={name}
            placeholder="Your Name"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs text-foreground/60"
          >
            email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={email}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-xs text-foreground/60"
          >
            message:
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Hi Pooja — ..."
            className={`${inputClasses} resize-y`}
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-bright transition-colors hover:bg-accent/20"
        >
          <span className="text-accent" aria-hidden>
            $
          </span>{" "}
          send message
        </button>
      </form>
    </>
  );
}

export default function ContactPage({
  searchParams,
}: PageProps<"/contact-me-server-form">) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>cat contact.txt</Cmd>
      <ul className="space-y-1.5 text-sm sm:text-base">
        <li>
          <span className="text-foreground/60">email · </span>
          <a
            href={`mailto:${EMAIL}`}
            className="text-accent-bright hover:underline"
          >
            {EMAIL}
          </a>
        </li>
        <li>
          <span className="text-foreground/60">linkedin · </span>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-highlight hover:underline"
          >
            {LINKEDIN_LABEL}
          </a>
        </li>
      </ul>

      <div className="mt-10">
        <Cmd>nano message.txt</Cmd>
        <Suspense fallback={null}>
          <ContactFormSection searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
