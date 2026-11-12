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
| `/about-me` | Bio, education, experience, and skills rendered as terminal command output |
| `/projects` | Project list styled like `ls projects/` |
| `/projects/[slug]` | Dynamically routed project detail pages: `tokenly`, `bronco-health`, `analytics-showdown` |
| `/blogs` | Public blog list — loaded in the browser from `GET /api/blogs`, each post links to its own page |
| `/blogs/[id]` | Dynamically routed blog post detail page, rendered from `data/blogs.json` |
| `/contact-me` | Contact form (client component) that sends the message as JSON to `POST /api/contact` |
| `/admin/blogs` | Blog management: create posts via `POST /api/blogs` and list existing ones via `GET /api/blogs` |
| `/contact-me-server-form` | Server-rendered contact form that saves submissions to a JSON file |

The mini terminal on the landing page supports: `help`, `about`, `projects`, `contact`, `clear` — anything else returns `command not found`.

## Folder structure

```
my-portfolio/
├── app/
│   ├── layout.tsx                 # dark theme, mono font, nav, metadata
│   ├── globals.css                # theme colors (green/purple), typing + blink animations
│   ├── page.tsx                   # / — landing page with typing animation
│   ├── about-me/page.tsx          # /about-me
│   ├── projects/
│   │   ├── page.tsx               # /projects
│   │   └── [slug]/page.tsx        # /projects/[slug] (dynamic route)
│   ├── blogs/
│   │   ├── page.tsx               # /blogs — list loaded from GET /api/blogs
│   │   └── [id]/page.tsx          # /blogs/[id] (dynamic blog post route)
│   ├── contact-me/page.tsx        # /contact-me (API-backed form)
│   ├── admin/blogs/page.tsx       # /admin/blogs (blog management)
│   ├── api/
│   │   ├── contact/route.ts       # POST /api/contact — saves to data/submissions.json
│   │   └── blogs/route.ts         # POST/GET /api/blogs — saves to/reads data/blogs.json
│   └── contact-me-server-form/
│       └── page.tsx               # /contact-me-server-form
├── actions/
│   └── submit-contact.ts          # server action invoked by the contact form
├── lib/
│   ├── projects.ts                # project data (single source for /projects routes)
│   ├── submissions.ts             # read/append helpers for data/submissions.json
│   └── blogs.ts                   # read/append helpers for data/blogs.json
├── components/
│   ├── cmd.tsx                    # shared `pooja@scu:~$` prompt line
│   ├── nav.tsx                    # shell-command nav with active-page highlight
│   ├── mini-terminal.tsx          # interactive terminal (client component)
│   ├── contact-api-form.tsx       # /contact-me form that fetch()es POST /api/contact
│   ├── blog-manager.tsx          # /admin/blogs create form + list (client component)
│   └── blog-list.tsx             # /blogs list that fetch()es GET /api/blogs (client component)
└── data/
    ├── submissions.json           # contact form submissions land here
    └── blogs.json                 # blog posts land here
```

## How the contact form works, step by step

From the browser to `data/submissions.json` with zero client-side JavaScript:

1. **Submit** — on `/contact-me-server-form`, pressing "send message" posts the `<form>` to a Next.js **Server Action** (`actions/submit-contact.ts`, marked with `'use server'`). The form works even with JavaScript disabled (progressive enhancement).
2. **Read** — the action receives the fields as `FormData` and pulls out `name`, `email`, and `message`.
3. **Validate (server-side)** — if any field is empty or the email is malformed, the action redirects back to the form with `?error=required` or `?error=email`, and the page shows a purple error banner.
4. **Write** — on success, `appendSubmission()` in `lib/submissions.ts` reads `data/submissions.json` with `node:fs/promises`, appends a new record, and writes the file back:

   ```json
   {
     "id": "47021a30-39b6-410d-aac0-dc5b424de495",
     "submittedAt": "2026-11-10T22:15:45.429Z",
     "name": "Prof Test",
     "email": "prof@scu.edu",
     "message": "Testing the form"
   }
   ```

5. **Confirm** — the action redirects to `?submitted=1` and the page shows a green success banner.

## Note on saving to JSON

The form writes to the server's filesystem with `node:fs/promises`, so submissions persist when the site runs on a machine with real storage — your laptop (`npm run dev` / `npm run start`), a VPS, or a Docker container.

This does **not** work on Vercel or other serverless hosts: their filesystems are ephemeral, so anything written to `data/submissions.json` would be lost on the next deploy or between isolated function invocations. To take this to a serverless deployment, swap the file write in `lib/submissions.ts` for a database or external storage.
