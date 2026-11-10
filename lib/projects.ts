export type Project = {
  slug: string;
  title: string;
  tagline: string;
  date: string;
  stack: string[];
  description: string;
  highlights: string[];
};

export const projects: Project[] = [
  {
    slug: "analytics-showdown",
    title: "Analytics Showdown",
    tagline: "Good Nature Agro Case Challenge",
    date: "May 2026",
    stack: ["Python", "LLM / AI Agent Development", "Tableau"],
    description:
      "A stakeholder-facing analytics consulting challenge for a social enterprise supporting African smallholder farmers, delivered as a case competition entry.",
    highlights: [
      "Applied exploratory analysis, segmentation, and KPI evaluation to understand farmer segments and performance drivers",
      "Built an AI-agent-assisted workflow in Python to accelerate the analysis, paired with Tableau dashboards for storytelling",
      "Delivered data-backed strategic recommendations aimed at a non-technical stakeholder audience",
    ],
  },
  {
    slug: "tokenly",
    title: "Tokenly",
    tagline: "LLM Cost Optimization Tool",
    date: "Apr 2026",
    stack: ["PostgreSQL", "Snowflake", "Next.js", "FastAPI", "Docker"],
    description:
      "An LLM cost-analytics dashboard that analyzes per-request token use, latency, and cost to help product teams understand and optimize model spend.",
    highlights: [
      "Tracks token usage, latency, and cost at the per-request level and rolls it up into team-facing views",
      "PostgreSQL and Snowflake for storage and analytics, with a FastAPI backend and a Next.js frontend, shipped in Docker",
      "Surfaces where model spend concentrates so product teams can tune prompts, models, and workloads",
    ],
  },
  {
    slug: "bronco-health",
    title: "Bronco Health",
    tagline: "AI Stress Prediction Platform",
    date: "Jan 2026",
    stack: ["Python", "Machine Learning", "GenAI", "React.js"],
    description:
      "An AI platform that predicts student stress risk and turns it into actionable wellness insights through a self-service dashboard.",
    highlights: [
      "Led the full machine learning product lifecycle, from analytics workflow design to shipped product",
      "Trained classification models to predict student stress risk from behavioral and wellness data",
      "Built a React.js dashboard with wellness trends and personalized recommendations for students",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
