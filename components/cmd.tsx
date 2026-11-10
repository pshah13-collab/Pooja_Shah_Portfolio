export function Cmd({ children }: { children: string }) {
  return (
    <p className="mb-3 text-sm">
      <span className="text-accent">pooja@scu:~$</span>{" "}
      <span className="text-foreground/60">{children}</span>
    </p>
  );
}
