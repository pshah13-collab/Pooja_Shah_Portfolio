import type { Metadata } from "next";
import { Cmd } from "@/components/cmd";

export const metadata: Metadata = {
  title: "About Me",
};

const BIO =
  "MSBA candidate at Santa Clara University (Dec 2026) with 3+ years of analytics experience. I started in HR analytics — forecasting hiring, modeling attrition, cutting 90-day turnover from 22% to 15% — and now build broader data products: a supplier risk intelligence platform for Google's Supply Chain Risk team, LLM cost dashboards, and student stress-prediction models. I like the part where messy data becomes a decision.";

const EDUCATION = [
  {
    name: "MS in Business Analytics",
    school: "Santa Clara University",
    meta: "Expected Dec 2026 · GPA 3.7/4.0",
  },
  {
    name: "MBA",
    school: "Ahmedabad University",
    meta: "2020 - 2022",
  },
  {
    name: "BBA",
    school: "Ahmedabad University",
    meta: "2017 - 2020",
  },
];

const EXPERIENCE = [
  {
    role: "Practicum Research Analyst",
    org: "Google — Supply Chain Risk Management",
    meta: "Jan 2026 - May 2026",
  },
  {
    role: "Teaching Assistant, Business Analytics",
    org: "Santa Clara University",
    meta: "Feb 2026 - Jun 2026",
  },
  {
    role: "Manager, HR & Analytics",
    org: "Linear Loop & Qable",
    meta: "Jan 2024 - Jan 2025",
  },
  {
    role: "Senior HR Analytics Executive",
    org: "Tatvic Analytics",
    meta: "Jan 2022 - Jan 2024",
  },
];

const SKILLS = [
  "Python",
  "SQL",
  "R",
  "Pandas",
  "NumPy",
  "scikit-learn",
  "Tableau",
  "Power BI",
  "Looker",
  "Excel",
  "BigQuery",
  "Snowflake",
  "PostgreSQL",
  "GCP",
  "Vertex AI",
  "Gemini",
  "RAG",
  "NLP",
  "FastAPI",
  "Docker",
  "Git",
];

export default function AboutMe() {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <Cmd>whoami</Cmd>
      <p className="text-xl sm:text-2xl">Pooja Shah — Aspiring Data Analyst</p>

      <div className="mt-10">
        <Cmd>cat bio.txt</Cmd>
        <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
          {BIO}
        </p>
      </div>

      <div className="mt-10">
        <Cmd>cat education.txt</Cmd>
        <ul className="space-y-2 text-sm sm:text-base">
          {EDUCATION.map((e) => (
            <li key={e.name}>
              <span className="text-foreground">{e.name}</span>
              <span className="text-foreground/60"> · {e.school}</span>
              <span className="text-highlight"> · {e.meta}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <Cmd>tail -n 4 experience.log</Cmd>
        <ul className="space-y-2 text-sm sm:text-base">
          {EXPERIENCE.map((e) => (
            <li key={e.role}>
              <span className="text-foreground">{e.role}</span>
              <span className="text-foreground/60"> · {e.org}</span>
              <span className="text-highlight"> · {e.meta}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <Cmd>ls skills/</Cmd>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map((s) => (
            <span
              key={s}
              className="rounded border border-accent/25 bg-accent/5 px-2 py-0.5 text-xs text-accent-bright"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
