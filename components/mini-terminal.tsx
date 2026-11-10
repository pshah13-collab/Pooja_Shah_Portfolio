"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Line = { id: number; text: string; kind: "in" | "out" | "err" };

const NAV_COMMANDS: Record<string, string> = {
  about: "/about-me",
  projects: "/projects",
  contact: "/contact-me-server-form",
};

const HELP_LINES = [
  "Available commands:",
  "  help       show this list",
  "  about      go to /about-me",
  "  projects   go to /projects",
  "  contact    go to /contact-me-server-form",
  "  clear      clear the terminal",
];

export function MiniTerminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([
    { id: 0, text: 'guest shell — type "help" to list commands.', kind: "out" },
  ]);
  const [value, setValue] = useState("");
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function run(raw: string) {
    const input = raw.trim();
    if (!input) return;

    const id = nextId.current;
    const appended: Line[] = [{ id, text: input, kind: "in" }];
    const cmd = input.toLowerCase();
    let nav: string | null = null;

    if (cmd === "help") {
      HELP_LINES.forEach((text, i) =>
        appended.push({ id: id + 1 + i, text, kind: "out" }),
      );
      nextId.current += HELP_LINES.length;
    } else if (cmd === "clear") {
      setLines([]);
      setValue("");
      return;
    } else if (NAV_COMMANDS[cmd]) {
      appended.push({
        id: id + 1,
        text: `navigating to ${NAV_COMMANDS[cmd]} ...`,
        kind: "out",
      });
      nextId.current += 1;
      nav = NAV_COMMANDS[cmd];
    } else {
      appended.push({
        id: id + 1,
        text: `command not found: ${input} — type "help" to list commands.`,
        kind: "err",
      });
      nextId.current += 1;
    }

    setLines((prev) => [...prev, ...appended]);
    setValue("");
    if (nav) router.push(nav);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-accent/25 bg-black/40 text-sm shadow-[0_0_40px_rgba(34,197,94,0.07)]">
      <div className="flex items-center gap-2 border-b border-accent/15 bg-white/[0.03] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-foreground/50">
          guest@pooja: ~
        </span>
      </div>
      <div
        ref={scrollRef}
        aria-live="polite"
        aria-label="interactive terminal"
        onClick={() => inputRef.current?.focus()}
        className="h-64 cursor-text overflow-y-auto px-3 py-3 sm:h-72"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className="leading-relaxed whitespace-pre-wrap break-words"
          >
            {line.kind === "in" ? (
              <>
                <span className="text-accent" aria-hidden>
                  ❯{" "}
                </span>
                <span className="text-foreground">{line.text}</span>
              </>
            ) : (
              <span
                className={
                  line.kind === "err"
                    ? "text-highlight"
                    : "text-foreground/75"
                }
              >
                {line.text}
              </span>
            )}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-accent" aria-hidden>
            ❯
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent text-base text-foreground caret-accent outline-none placeholder:text-foreground/30"
            placeholder='type "help"'
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            enterKeyHint="send"
            aria-label="terminal command input"
          />
        </form>
      </div>
    </div>
  );
}
