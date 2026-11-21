# Pooja Shah — Terminal Portfolio

A personal portfolio site that looks and feels like a terminal instead of a traditional website. Built with Next.js (App Router), TypeScript, and Tailwind CSS — no extra runtime packages.

## The idea

The whole site is styled as a shell session: dark background, monospace font (Geist Mono), green for the prompt and primary accents, purple for highlights. Navigation links are shell commands (`cd /about-me`, `ls /projects`), page content is framed as command output (`whoami`, `cat bio.txt`, `ls skills/`), and the landing page greets you with a typing animation and an interactive mini terminal you can actually type commands into.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production build:

```bash
npm run build
npm run start
```

## Pages / routes

| Route | What you see |
| --- | --- |
| `/` | Typing animation (`> Hi, I'm Pooja Shah`) with a blinking caret, tagline, and an interactive mini terminal |
| `/about-me` | Bio, education, experience, and skills rendered as terminal command output, with a skills venn diagram |
| `/projects` | Project list styled like `ls projects/`, loaded from `data/projects.json` |
| `/projects/[slug]` | Dynamically routed project detail pages |
| `/blogs` | Public blog list — loaded in the browser from `GET /api/blogs`, each post links to its own page |
| `/blogs/[id]` | Dynamically routed blog post detail page (also reachable at `/blog-posts/[id]`) |
| `/meet` | Coffee-chat scheduler — pick an open slot, book a 15-minute call, get a code to reschedule or cancel; includes a private question notepad |
| `/contact-me` | Contact form (client component) that sends the message as JSON to `POST /api/contact` |
| `/contact-me-server-form` | Server-rendered contact form that saves submissions to a JSON file |
| `/admin/blogs` | Blog management — create, edit, and remove posts (full CRUD) |
| `/admin/projects` | Project management — create, edit, and remove projects (full CRUD) |
| `/admin/contacts` | Contact inbox — read submissions, mark them responded, remove them |
| `/admin/meetings` | Meeting requests — confirm, decline, remove, and block/unblock calendar days |

The mini terminal on the landing page supports: `help`, `about`, `projects`, `blogs`, `contact`, `meet`, `cal` (lists live open slots), `cv`, `email`, `whoami`, `clear` — anything else returns `command not found`.

## API

Every object is served over an API and backed by a JSON file, with full CRUD.

| Endpoint | Methods | Storage |
| --- | --- | --- |
| `/api/projects` | GET, POST | `data/projects.json` |
| `/api/projects/[slug]` | GET, PUT, DELETE | `data/projects.json` |
| `/api/blogs` | GET, POST | `data/blogs.json` |
| `/api/blogs/[id]` | GET, PUT, DELETE | `data/blogs.json` |
| `/api/contact` (alias `/api/contacts`) | GET, POST | `data/submissions.json` |
| `/api/contact/[id]` | GET, PUT, DELETE | `data/submissions.json` |
| `/api/bookings` | GET, POST | `data/bookings.json` |
| `/api/bookings/[id]` | PUT, DELETE | `data/bookings.json` |
| `/api/availability` | GET, POST, DELETE | `data/availability.json` |
| `/api/availability/[date]` | PUT | `data/availability.json` |
| `/api/logs` | GET | `data/logs.json` |

Validation lives in the route handlers (required fields, length caps, email format, ISO datetimes, duplicate-slot protection). Invalid requests get a 400 with a plain-text explanation; unknown ids get a 404; a booking code mismatch gets a 403.

## Server logs

Every API request is logged with timestamp, method, path, status, and duration:

- to **stdout** (`[api] 2026-... GET /api/blogs -> 200 (1ms)`) — visible in the dev terminal and in Vercel's runtime logs,
- and appended as JSON lines to `data/logs.json`, which `GET /api/logs` returns.

## The coffee-chat scheduler

`/meet` turns "contact me" into "book time with me":

1. **Pick a time** — the page renders the next open weekday slots (12:30 / 17:30 PT), skipping booked slots and days blocked in `/admin/meetings`.
2. **Book** — the form posts to `POST /api/bookings`; the visitor gets a 6-character booking code and can download a `.ics` calendar invite.
3. **Reschedule or cancel** — `PUT`/`DELETE /api/bookings/[id]` require the booking code, so no account is needed.
4. **Admin side** — `/admin/meetings` confirms, declines, or removes requests and manages blocked days (vacations, finals) via `/api/availability`.

The visitor's question notepad is the one piece that intentionally uses **localStorage** instead of the backend: it's private, per-browser scratch space (`lib/notepad.ts` handles all reads/writes with validation against corrupt data). Open questions are prefilled into the booking form, so they arrive with the meeting request.

## Componentization

Shared pieces live in `components/` and `lib/`:

- `slot-list.tsx` — the open-slot grid, reused by the booking flow and the reschedule panel
- `status-banner.tsx` — success/error banner used by every form and admin page
- `cmd.tsx`, `nav.tsx`, `mini-terminal.tsx`, `venn-diagram.tsx`, `about-tabs.tsx`
- `blog-list.tsx`, `blog-manager.tsx`, `project-manager.tsx`, `contact-inbox.tsx`, `meeting-manager.tsx`, `meet-scheduler.tsx`, `meet-notepad.tsx`
- storage helpers isolated per object in `lib/` (`projects.ts`, `blogs.ts`, `submissions.ts`, `bookings.ts`, `availability.ts`, `logger.ts`), browser storage in `lib/notepad.ts`, shared slot generation in `lib/slots.ts`, calendar export in `lib/calendar-ics.ts`, shared form styles in `lib/ui.ts`

## Publishing content

Blog posts and projects are public content, so they live in the repo. After publishing locally, push them live:

```bash
./publish    # commits data/blogs.json and pushes — Vercel auto-deploys
```

## How the contact form works, step by step

From the browser to `data/submissions.json`:

1. **Submit** — on `/contact-me-server-form`, pressing "send message" posts the `<form>` to a Next.js **Server Action** (`actions/submit-contact.ts`, marked with `'use server'`). The form works even with JavaScript disabled (progressive enhancement).
2. **Read** — the action receives the fields as `FormData` and pulls out `name`, `email`, and `message`.
3. **Validate (server-side)** — if any field is empty or the email is malformed, the action redirects back with `?error=required` or `?error=email`.
4. **Write** — on success, `appendSubmission()` in `lib/submissions.ts` reads the JSON file with `node:fs/promises`, appends a record, and writes it back.
5. **Confirm** — the action redirects to `?submitted=1` and the page shows a green success banner.

The API-backed form at `/contact-me` does the same through `POST /api/contact` from a client component.

## Note on saving to JSON

All writes go to the server's filesystem with `node:fs/promises`, so data persists when the site runs on a machine with real storage — your laptop (`npm run dev` / `npm run start`), a VPS, or a Docker container.

This does **not** persist on Vercel or other serverless hosts: their filesystems are ephemeral/read-only. The APIs detect this and return a clear 500 explaining it instead of failing silently. Reads still work everywhere, and `console` logging still reaches Vercel's log drains. To take writes to production, swap the file helpers in `lib/` for a database.

## License

[MIT](LICENSE)
