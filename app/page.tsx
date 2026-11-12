import { MiniTerminal } from "@/components/mini-terminal";
import { Cmd } from "@/components/cmd";

const NAME = "Pooja Shah";
const TAGLINE = "Aspiring data analyst — turning data into decisions";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="whitespace-nowrap text-2xl sm:text-4xl">
        <span className="typing-text">{`> Hi, I'm ${NAME}`}</span>
        <span className="caret" aria-hidden />
      </h1>
      <p className="mt-4 text-sm text-foreground/70 sm:text-base">
        <span className="text-highlight">$</span> {TAGLINE}
      </p>

      <div className="mt-8">
        <Cmd>open cv.pdf</Cmd>
        <a
          href="/Pooja-Shah-Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-wrap items-baseline gap-x-2 rounded-lg border border-accent/20 bg-black/30 px-4 py-2.5 text-sm transition-colors hover:border-accent/50 hover:bg-accent/5"
        >
          <span className="text-accent" aria-hidden>
            -rw-r--r--
          </span>
          <span className="font-medium text-foreground transition-colors hover:text-accent-bright">
            Pooja Shah Resume
          </span>
        </a>
      </div>

      <div className="mt-10 sm:mt-14">
        <p className="mb-3 text-sm text-foreground/50">
          <span className="text-accent-bright">tip:</span> an interactive
          terminal lives below — type <span className="text-accent">help</span>
        </p>
        <MiniTerminal />
      </div>
    </section>
  );
}
