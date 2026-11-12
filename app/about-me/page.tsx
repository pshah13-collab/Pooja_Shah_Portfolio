import type { Metadata } from "next";
import { Cmd } from "@/components/cmd";
import { AboutTabs } from "@/components/about-tabs";

export const metadata: Metadata = {
  title: "About Me",
};

export default function AboutMe() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>whoami</Cmd>
      <p className="text-xl sm:text-2xl">Pooja Shah — Aspiring Data Analyst</p>

      <div className="mt-10">
        <p className="mb-3 text-sm text-foreground/50">
          <span className="text-accent-bright">tip:</span> click a file to
          switch sections
        </p>
        <AboutTabs />
      </div>
    </section>
  );
}
