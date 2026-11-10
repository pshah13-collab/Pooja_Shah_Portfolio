import { MiniTerminal } from "@/components/mini-terminal";

const NAME = "[your name]";
const TAGLINE = "cs student who likes building web stuff";

export default function Home() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl sm:text-4xl">
        <span className="typing-text">{`> hi, i'm ${NAME}`}</span>
        <span className="caret" aria-hidden />
      </h1>
      <p className="mt-4 text-sm text-foreground/70 sm:text-base">
        <span className="text-highlight">$</span> {TAGLINE}
      </p>

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
