"use client";
import { copy } from "./pipeline-figure.content";

import { FigureStep, ProcessFigure, type ProcessStep } from "@hulianui/ui";
import type { PaperStage, PaperSummary } from "../_data/types";
import { STAGES, STAGE_LABEL } from "./stage";

// The production pipeline drawn as a step-by-step ProcessFigure: one step per stage.
// Each stage node carries the papers currently in it, so the figure is also a live board.
// The review stage owns a dashed loop back to drafting (review comments flow back).

const DESC: Record<PaperStage, string> = {
  topic: copy("topicDesc"),
  survey: copy("surveyDesc"),
  drafting: copy("draftingDesc"),
  figures: copy("figuresDesc"),
  review: copy("reviewDesc"),
  submission: copy("submissionDesc"),
  published: copy("publishedDesc"),
};

export const PIPELINE_STEPS: ProcessStep[] = STAGES.map((stage) => ({
  key: stage,
  label: STAGE_LABEL[stage],
  description: DESC[stage],
}));

const NODE_W = 92;
const GAP = 18;
const X0 = 8;
const NODE_Y = 34;
const NODE_H = 54;
const cx = (i: number) => X0 + i * (NODE_W + GAP) + NODE_W / 2;
const WIDTH = X0 * 2 + STAGES.length * NODE_W + (STAGES.length - 1) * GAP;

const BOX =
  "fill-surface stroke-muted-foreground [stroke-width:1.1] group-data-[phase=on]/step:fill-primary/10 group-data-[phase=on]/step:stroke-primary group-data-[phase=on]/step:[stroke-width:2]";
const EDGE = "fill-none stroke-muted-foreground [stroke-width:1.4] group-data-[phase=on]/step:stroke-primary";
const FLOW =
  "group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]";
const HEAD = "fill-muted-foreground group-data-[phase=on]/step:fill-primary";

/** Chips are 84 units wide: about 7 CJK or 13 Latin characters at this size. */
function chipText(text: string) {
  const max = /[\u3400-\u9fff]/.test(text) ? 7 : 13;
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

export function PipelineDiagram({ papers }: { papers: PaperSummary[] }) {
  const maxChips = Math.max(1, ...STAGES.map((s) => papers.filter((p) => p.stage === s).length));
  const height = NODE_Y + NODE_H + 70 + maxChips * 24;
  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={copy("pipelineAria")} className="mx-auto block h-auto w-full">
      {STAGES.map((stage, i) => {
        const inStage = papers.filter((p) => p.stage === stage);
        const x = cx(i);
        return (
          <FigureStep key={stage} at={stage}>
            {i > 0 ? (
              <>
                <path d={`M${cx(i - 1) + NODE_W / 2 + 1} ${NODE_Y + NODE_H / 2}H${x - NODE_W / 2 - 7}`} className={`${EDGE} ${FLOW}`} />
                <polygon
                  points={`${x - NODE_W / 2 - 1},${NODE_Y + NODE_H / 2} ${x - NODE_W / 2 - 8},${NODE_Y + NODE_H / 2 - 4} ${x - NODE_W / 2 - 8},${NODE_Y + NODE_H / 2 + 4}`}
                  className={HEAD}
                />
              </>
            ) : null}
            <rect x={x - NODE_W / 2} y={NODE_Y} width={NODE_W} height={NODE_H} rx={10} className={BOX} />
            <text x={x} y={NODE_Y + 23} textAnchor="middle" className="fill-foreground text-[13px] font-semibold group-data-[phase=on]/step:fill-primary">
              {STAGE_LABEL[stage]}
            </text>
            <text x={x} y={NODE_Y + 41} textAnchor="middle" className="fill-muted-foreground text-[11px] tabular-nums">
              {copy("paperCount", inStage.length)}
            </text>
            {inStage.map((p, j) => (
              <g key={p.id}>
                <rect
                  x={x - NODE_W / 2 + 4}
                  y={NODE_Y + NODE_H + 52 + j * 24}
                  width={NODE_W - 8}
                  height={18}
                  rx={9}
                  className="fill-subtle stroke-border [stroke-width:1] group-data-[phase=on]/step:fill-primary group-data-[phase=on]/step:stroke-primary"
                />
                <text
                  x={x}
                  y={NODE_Y + NODE_H + 65 + j * 24}
                  textAnchor="middle"
                  className="fill-foreground text-[10.5px] group-data-[phase=on]/step:fill-primary-foreground"
                >
                  {chipText(p.short)}
                </text>
              </g>
            ))}
            {stage === "review" ? (
              <>
                <path
                  d={`M${x} ${NODE_Y + NODE_H + 1}V${NODE_Y + NODE_H + 26}H${cx(2)}V${NODE_Y + NODE_H + 8}`}
                  className={`${EDGE} [stroke-dasharray:4_3] ${FLOW}`}
                />
                <polygon
                  points={`${cx(2)},${NODE_Y + NODE_H + 1} ${cx(2) - 4},${NODE_Y + NODE_H + 8} ${cx(2) + 4},${NODE_Y + NODE_H + 8}`}
                  className={HEAD}
                />
                <text x={(x + cx(2)) / 2} y={NODE_Y + NODE_H + 42} textAnchor="middle" className="fill-muted-foreground text-[11px] group-data-[phase=on]/step:fill-primary">
                  {copy("revisionLoop")}
                </text>
              </>
            ) : null}
          </FigureStep>
        );
      })}
    </svg>
  );
}

export function PipelineFigure({ papers, defaultStage }: { papers: PaperSummary[]; defaultStage?: PaperStage }) {
  return (
    <ProcessFigure
      id="fig-pipeline"
      steps={PIPELINE_STEPS}
      caption={copy("caption")}
      overviewDescription={copy("overview")}
      defaultState={defaultStage ?? "all"}
      interval={1800}
      printSubfigures={[]}
    >
      <PipelineDiagram papers={papers} />
    </ProcessFigure>
  );
}
