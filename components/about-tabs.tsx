"use client";

import { useState } from "react";
import { Cmd } from "@/components/cmd";
import { VennDiagram } from "@/components/venn-diagram";

const TABS = [
  { id: "venn", label: "me.svg", cmd: "python3 venn.py" },
  { id: "bio", label: "bio.txt", cmd: "cat bio.txt" },
  { id: "education", label: "education.txt", cmd: "cat education.txt" },
  { id: "experience", label: "experience.log", cmd: "tail -n 4 experience.log" },
  { id: "skills", label: "skills/", cmd: "ls skills/" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const BIO_MAIN =
  "MSBA candidate at Santa Clara University (Dec 2026) with 3+ years of analytics experience. I started in HR analytics — forecasting hiring, modeling attrition, cutting 90-day turnover from 22% to 15% — and now build broader data products: a supplier risk intelligence platform for Google's Supply Chain Risk team, LLM cost dashboards, and student stress-prediction models.";

const BIO_QUOTE = "I like the part where messy data becomes a decision.";

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

const SKILL_GROUPS = [
  {
    folder: "languages/",
    skills: ["Python", "SQL", "R", "Pandas", "NumPy", "Excel"],
  },
  {
    folder: "ml-ai/",
    skills: ["scikit-learn", "Vertex AI", "Gemini", "RAG", "NLP"],
  },
  {
    folder: "bi-visualization/",
    skills: ["Tableau", "Power BI", "Looker"],
  },
  {
    folder: "cloud-data/",
    skills: [
      "BigQuery",
      "Snowflake",
      "PostgreSQL",
      "GCP",
      "FastAPI",
      "Docker",
      "Git",
    ],
  },
];

const tabButtonClasses = (active: boolean) =>
  `cursor-pointer rounded px-1.5 py-0.5 text-xs transition-colors sm:text-sm ${
    active
      ? "bg-accent/10 text-accent-bright"
      : "text-foreground/55 hover:bg-highlight/10 hover:text-highlight"
  }`;

function BioContent() {
  return (
    <div>
      <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
        {BIO_MAIN}
      </p>
      <p className="mt-3 border-l-2 border-accent/40 pl-3 text-sm text-accent-bright sm:text-base">
        “{BIO_QUOTE}”
      </p>
    </div>
  );
}

function EducationContent() {
  return (
    <ul className="space-y-2.5 text-sm sm:text-base">
      {EDUCATION.map((e, index) => (
        <li key={e.name} className="flex gap-2">
          <span className="text-accent" aria-hidden>
            {index === EDUCATION.length - 1 ? "└─" : "├─"}
          </span>
          <span>
            <span className="text-foreground">{e.name}</span>
            <span className="text-foreground/60"> · {e.school}</span>
            <span className="text-highlight"> · {e.meta}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ExperienceContent() {
  return (
    <ul className="space-y-2.5 text-sm sm:text-base">
      {EXPERIENCE.map((e, index) => (
        <li key={e.role} className="flex gap-2">
          <span className="text-accent" aria-hidden>
            {index === EXPERIENCE.length - 1 ? "└─" : "├─"}
          </span>
          <span>
            <span className="text-foreground">{e.role}</span>
            <span className="text-foreground/60"> · {e.org}</span>
            <span className="text-highlight"> · {e.meta}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function SkillsContent() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {SKILL_GROUPS.map((group) => (
        <div key={group.folder}>
          <p className="mb-2 text-xs text-foreground/60">
            <span className="text-accent">▸</span> {group.folder}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="rounded border border-accent/25 bg-accent/5 px-2 py-0.5 text-xs text-accent-bright"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AboutTabs() {
  const [active, setActive] = useState<TabId>("venn");
  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="About sections"
        className="flex items-center gap-1 overflow-x-auto rounded-t-lg border border-accent/20 bg-black/40 px-2 py-2"
      >
        <span className="mr-1 flex shrink-0 gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={tabButtonClasses(active === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="rounded-b-lg border border-t-0 border-accent/20 bg-black/30 p-4 sm:p-5"
      >
        <Cmd>{activeTab.cmd}</Cmd>
        {active === "bio" && <BioContent />}
        {active === "venn" && <VennDiagram />}
        {active === "education" && <EducationContent />}
        {active === "experience" && <ExperienceContent />}
        {active === "skills" && <SkillsContent />}
      </div>
    </div>
  );
}
