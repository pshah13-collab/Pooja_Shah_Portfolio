# AI Prompt Log — Terminal Portfolio

This project was built with an AI coding assistant (Viber CLI). Every feature below started as a prompt from me; the assistant implemented, and I tested and course-corrected at each checkpoint. This log records the prompts in order and what each one produced.

**Workflow:** I prompted in small steps, reviewed each result in the browser, then asked for changes — this log shows that loop (build → test → adjust) repeating throughout the project.

---

## Phase 0 — Orientation & base site recovery

| # | Prompt | Outcome |
|---|--------|---------|
| 1 | "Not this one, the portfolio website" (after assistant found the wrong project) | Located the correct terminal-themed Next.js project |
| 2 | "The current live website is not what I built earlier — it was terminal themed. This shows something else." | Discovered an old static site was being confused with the real portfolio; re-targeted the terminal Next.js app |

## Phase 1 — Contact form over an API

| # | Prompt | Outcome |
|---|--------|---------|
| 3 | "We had a contact-me page without an API. Add a new /contact-me page that makes an API call. Build the API to support a POST request to /api/contact. Store all contact information in a JSON." | `app/api/contact/route.ts` (validated POST), `components/contact-api-form.tsx`, submissions saved to `data/submissions.json` |
| 4 | "Okay, let's test it now — give me commands." | curl test suite: 201 on valid POST, 400 on invalid email/blank fields |
| 5 | "Can the URL be changed? It's very big and I don't want to spend money." | Migrated to a GitHub-connected Vercel deploy → `https://pooja-shah-portfolio.vercel.app` |

## Phase 2 — Blogs over an API

| # | Prompt | Outcome |
|---|--------|---------|
| 6 | "Create an /admin/blogs page for management of my blog posts. Build the API to support a POST request to /api/blogs." | `lib/blogs.ts`, `app/api/blogs/route.ts`, `components/blog-manager.tsx`, `/admin/blogs` |
| 7 | "Add a new /blogs page that makes an API call to /api/blogs. Support a GET request to populate it. Ensure all posts are visible and blog posts can be routed dynamically." | `components/blog-list.tsx` (client fetch of GET), `/blogs`, dynamic `/blogs/[id]` |
| 8 | "Can you make it easier for me to understand?" | Walkthrough of the request/response cycle (client → fetch → API → JSON file → response) |

## Phase 3 — Content & UX polish (iterative prompts)

| # | Prompt | Outcome |
|---|--------|---------|
| 9 | "Add my CV link to the front page." (attached PDF) | Resume PDF in `public/`, `open cv.pdf` card on the landing page |
| 10 | "In the about-me section there's a lot of text." | Redesigned `/about-me` as tabbed terminal files: `bio.txt`, `education.txt`, `experience.log`, `skills/` |
| 11 | "As a user I wouldn't know there's a switch feature." | Added a hint line + cursor feedback on the tabs |
| 12 | "How about we add some more interactive features? Suggest a few." | 9 suggestions; I picked several to trial |
| 13 | "You can remove the download CV tab." / "Keep the typing animation still." / "Remove sudo hire-pooja." / "You can remove the theme switcher as well." | Cut the features that didn't fit; kept mini-terminal commands, prev/next blog navigation |
| 14 | "I want a venn diagram in the about-me page: $ analyze / $ predict / $ build." | `components/venn-diagram.tsx` — interactive SVG, added as a tab (later renamed `whoami.svg`, made the default) |
| 15 | "Now let's push changes on GitHub." | First production commits to `Pooja_Shah_Portfolio` |

## Phase 4 — Deployment

| # | Prompt | Outcome |
|---|--------|---------|
| 16 | "Yes, let's do Vercel." | Vercel CLI deploy; disabled deployment protection; documented the serverless read-only caveat |
| 17 | "It's very big and I don't want to spend money." (on the auto-generated URL) | Re-created the project via GitHub import → clean URL `pooja-shah-portfolio.vercel.app`, auto-deploy on push |
| 18 | "Is there an easy way to publish without committing every time?" | `./publish` — one command to commit + push blog content |

## Phase 5 — Assignment requirements round 2 (full CRUD + meaningful feature)

| # | Prompt | Outcome |
|---|--------|---------|
| 19 | "We need full CRUD interfaces for the contact, blog, and project objects. Add a meaningful feature that stores data in backend JSON and uses an API. Build the entire CRUD interface for it. And componentize as much as reasonable." | Full gap analysis: projects had no API at all, blogs/contacts lacked Update/Delete |
| 20 | "Can you scrape GitHub repos of other people and see what's innovative — what recruiters found interesting?" | Researched high-star portfolio repos (terminal-portfolio, m4tt72/terminal, developerFolio); synthesized feature candidates |
| 21 | "Let's do the coffee one." | Built the coffee-chat scheduler (details below) |

**Coffee scheduler build:**

| # | Prompt | Outcome |
|---|--------|---------|
| 22 | (part of 21) | `data/bookings.json`, `lib/bookings.ts`, `POST/GET /api/bookings`, `PUT/DELETE /api/bookings/[id]` with booking codes, `/meet` booking page, `/admin/meetings` |
| 23 | "The meeting page looks a little confusing — make it simpler." | Rebuilt as a guided flow: step 1 pick a time → step 2 details → confirmation card with code; manage-by-code tucked into a collapsible section |
| 24 | Full CRUD for projects: JSON + API + `/admin/projects`; blogs gained edit/delete; contacts gained an admin inbox with mark-responded | Complete CRUD on all assignment objects |

## Phase 6 — Integrations (iterative additions)

| # | Prompt | Outcome |
|---|--------|---------|
| 25 | "Add a small notepad where visitors write questions they want to ask before the coffee chat." | `components/meet-notepad.tsx` — localStorage-backed question list with add/toggle/remove |
| 26 | "I also want the user to be able to edit the notes." | Inline `[ edit ]` with save/cancel |
| 27 | "Add a feature that says 'no questions yet' — make it more user-friendly." | Friendly empty state with one-tap example chips |
| 28 | "If the saved data gets broken, show a warning and start fresh instead of breaking the page." | Validation in `loadQuestions()`: salvage valid entries, warn, self-heal |
| 29 | "If visitors send their questions along with the booking, I see them in /admin/meetings." | Open questions prefill the booking form; stored with the booking; shown as "their questions" in the admin |
| 30 | "More integrations?" → chose: .ics download, terminal commands, blocked days | `.ics` calendar export after booking; `cal` + `meet` commands in the mini-terminal; availability blocking (`/api/availability`) so blocked days vanish from `/meet` |
| 31 | "I need to be able to edit the blocked days too, not just add and delete." | `PUT /api/availability/[date]` + inline edit UI (move day, set note); 409 on collisions |

## Phase 7 — Server logs, componentization, housekeeping

| # | Prompt | Outcome |
|---|--------|---------|
| 32 | "We also need to have server logs." | `lib/logger.ts` — every API call logged (timestamp, method, path, status, duration) to stdout + `data/logs.json`; `GET /api/logs` |
| 33 | "Make the slots a separate component that gets the data from the page." | `components/slot-list.tsx` — presentational, props down / events up; page fetches initial data server-side |
| 34 | "Keep the notepad save/load code in its own file so it's easy to explain." | `lib/notepad.ts` — all localStorage logic isolated from the UI |
| 35 | "Make a ProjectCard and a BlogCard, use them on the projects and blogs pages, passing the data as props." | `components/project-card.tsx`, `components/blog-card.tsx` |
| 36 | "I think we need an MIT license." | `LICENSE` + `license` field in `package.json` |
| 37 | "The PUT for blocked days still doesn't have the server log like the other APIs." (found by checking the live site) | Wired the missing endpoint through the logger |
| 38 | "The notepad loses my questions when I refresh — I think it's saving the empty list before it loads the old ones." (bug found by me) | Root-caused: the save effect ran on mount before the load timer. Fixed with a `loaded` gate |
| 39 | "Update the README and push everything, then test." | README rewritten (routes, API table, scheduler, componentization, serverless caveat); verified live on Vercel |

---

## What the AI did well / where I corrected it

- **Good at:** scaffolding consistent patterns (every API route follows the same validate → write → respond shape), catching up on existing code fast, exhaustive curl-based verification, documenting as it goes.
- **Where I corrected it:** it initially built the contact API in the wrong project folder; suggested features I didn't like (downloaded CV button, typing animation, theme switcher — all cut); built the meeting page too complex on the first pass; and introduced a localStorage race condition that I caught by testing. Each one was found by me using the site, fixed by a short follow-up prompt — which is why the log above is long but the final product is clean.
