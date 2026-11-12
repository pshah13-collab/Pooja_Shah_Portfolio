"use client";

import { useState } from "react";

type CircleId = "analyze" | "predict" | "build";

const CIRCLE_DATA: Record<
  CircleId,
  {
    label: string;
    cx: number;
    cy: number;
    lx: number;
    ly: number;
    anchor: "start" | "middle" | "end";
    color: string;
    what: string;
    tools: string;
    proof: string;
  }
> = {
  analyze: {
    label: "$ analyze",
    cx: 150,
    cy: 112,
    lx: 150,
    ly: 24,
    anchor: "middle",
    color: "var(--accent)",
    what: "finding the story in messy data",
    tools: "SQL · Python · Tableau · Power BI",
    proof: "attrition models, hiring forecasts, turnover 22% → 15%",
  },
  predict: {
    label: "$ predict",
    cx: 118,
    cy: 178,
    lx: 12,
    ly: 272,
    anchor: "start",
    color: "var(--highlight)",
    what: "models that look ahead",
    tools: "scikit-learn · Vertex AI · NLP",
    proof: "student stress prediction, synthetic-vs-real ML study",
  },
  build: {
    label: "$ build",
    cx: 182,
    cy: 178,
    lx: 288,
    ly: 272,
    anchor: "end",
    color: "#38bdf8",
    what: "shipping what the data suggests",
    tools: "FastAPI · Docker · GCP · BigQuery",
    proof: "supplier risk platform, LLM cost dashboards",
  },
};

const ORDER: CircleId[] = ["analyze", "predict", "build"];

export function VennDiagram() {
  const [active, setActive] = useState<CircleId | null>(null);
  const current = active ? CIRCLE_DATA[active] : null;

  return (
    <div>
      <svg
        viewBox="0 0 300 290"
        role="img"
        aria-label="Venn diagram of my three skillsets — analyze, predict, build — overlapping on me"
        className="mx-auto block w-full max-w-[300px]"
      >
        {ORDER.map((id) => {
          const circle = CIRCLE_DATA[id];
          const isActive = active === id;
          const dimmed = active !== null && !isActive;
          return (
            <g key={id}>
              <circle
                cx={circle.cx}
                cy={circle.cy}
                r={72}
                fill={circle.color}
                stroke={circle.color}
                strokeWidth={1.5}
                style={{
                  fillOpacity: isActive ? 0.18 : 0.07,
                  strokeOpacity: dimmed ? 0.25 : 0.55,
                  transition: "fill-opacity 0.2s, stroke-opacity 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setActive(id)}
                onMouseLeave={() => setActive(null)}
                onClick={() =>
                  setActive((prev) => (prev === id ? null : id))
                }
              />
              <text
                x={circle.lx}
                y={circle.ly}
                textAnchor={circle.anchor}
                fontSize={12}
                fill={circle.color}
                style={{
                  fillOpacity: dimmed ? 0.35 : 0.95,
                  transition: "fill-opacity 0.2s",
                }}
              >
                {circle.label}
              </text>
            </g>
          );
        })}
        <text
          x={150}
          y={158}
          textAnchor="middle"
          fontSize={11}
          fill="var(--accent-bright)"
          opacity={active ? 0.45 : 1}
          style={{ transition: "opacity 0.2s" }}
        >
          me
        </text>
      </svg>

      <div className="mt-4 rounded-lg border border-accent/20 bg-black/30 p-4 text-sm">
        <p>
          <span className="text-accent" aria-hidden>
            pooja@scu:~$
          </span>{" "}
          <span className="text-foreground/60">
            man {active ?? "pooja"}
          </span>
        </p>
        {current ? (
          <div className="mt-2 space-y-1 text-foreground/75">
            <p>{current.what}</p>
            <p>
              <span className="text-foreground/50">tools · </span>
              {current.tools}
            </p>
            <p>
              <span className="text-foreground/50">proof · </span>
              {current.proof}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-foreground/50">
            hover or tap a circle — analyze, predict, build
          </p>
        )}
      </div>
    </div>
  );
}
