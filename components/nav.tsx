"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "cd ~" },
  { href: "/about-me", label: "cd /about-me" },
  { href: "/projects", label: "ls /projects" },
  { href: "/contact-me-server-form", label: "curl /contact-me-server-form" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-accent/20 bg-black/30">
      <nav className="mx-auto flex max-w-2xl items-center gap-1 overflow-x-auto px-3 py-2.5 text-sm whitespace-nowrap sm:px-6">
        <span className="mr-2 hidden text-accent sm:inline" aria-hidden>
          visitor@site:~$
        </span>
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded px-1.5 py-0.5 transition-colors ${
                active
                  ? "bg-accent/10 text-accent-bright"
                  : "text-foreground/55 hover:bg-highlight/10 hover:text-highlight"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
