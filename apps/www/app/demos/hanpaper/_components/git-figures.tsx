"use client";
import { copy } from "./git-figures.content";

import { Segmented, Slider, usePaperTerm, FigureStep, PaperFigure, ProcessFigure, type ProcessStep } from "@hulianui/ui";

// Four step-by-step figures for the Git paper plus one parametric figure.
// Conventions follow the Paper docs:
//  - every figure is a single <svg>, no ids inside (print sub-figures render it several times),
//    arrow heads are polygons instead of markers;
//  - FigureStep only drives opacity; emphasis for the current step is written with
//    group-data-[phase=on]/step: classes;
//  - moving things (branch refs, replaced commits) are drawn twice, the old copy with `until`.

const EDGE = "fill-none stroke-muted-foreground [stroke-width:1.4] group-data-[phase=on]/step:stroke-primary";
const FLOW =
  "group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]";
const HEAD = "fill-muted-foreground group-data-[phase=on]/step:fill-primary";
const BOX =
  "stroke-muted-foreground [stroke-width:1.1] group-data-[phase=on]/step:stroke-primary group-data-[phase=on]/step:[stroke-width:2]";
const TEXT = "fill-foreground text-[13px]";
const SMALL = "fill-muted-foreground text-[11px]";
const MONO = "fill-foreground font-mono text-[11px]";
const MONO_MUTED = "fill-muted-foreground font-mono text-[11px]";
const SVG_CLASS = "mx-auto block h-auto w-full max-w-[640px]";

/** A straight arrow from (x1, y1) to (x2, y2); the head is a polygon at (x2, y2). */
function Arrow({ x1, y1, x2, y2, flow = true }: { x1: number; y1: number; x2: number; y2: number; flow?: boolean }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 8;
  const half = 4;
  const bx = x2 - len * Math.cos(angle);
  const by = y2 - len * Math.sin(angle);
  const px = half * Math.sin(angle);
  const py = -half * Math.cos(angle);
  const head = `${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`;
  return (
    <>
      <path d={`M${x1} ${y1}L${bx} ${by}`} className={`${EDGE} ${flow ? FLOW : ""}`} />
      <polygon points={head} className={HEAD} />
    </>
  );
}

/** A polyline whose last segment ends in an arrow head. */
function PathArrow({ points, flow = true }: { points: [number, number][]; flow?: boolean }) {
  const [x1, y1] = points[points.length - 2];
  const [x2, y2] = points[points.length - 1];
  const body = points
    .slice(0, -1)
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
    .join("");
  return (
    <>
      {points.length > 2 ? <path d={body} className={`${EDGE} ${flow ? FLOW : ""}`} /> : null}
      <Arrow x1={x1} y1={y1} x2={x2} y2={y2} flow={flow} />
    </>
  );
}

// ── Figure 1: three trees ──

export const TREES_STEPS: ProcessStep[] = [
  { key: "edit", label: copy("treesEditLabel"), description: copy("treesEditDesc") },
  { key: "add", label: copy("treesAddLabel"), description: copy("treesAddDesc") },
  { key: "commit", label: copy("treesCommitLabel"), description: copy("treesCommitDesc") },
  { key: "restore", label: copy("treesRestoreLabel"), description: copy("treesRestoreDesc") },
];

const COL_W = 150;

function VersionChip({ x, y, label, active = false }: { x: number; y: number; label: string; active?: boolean }) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={24}
        height={16}
        rx={3}
        className={
          active
            ? "fill-primary/15 stroke-primary [stroke-width:1] group-data-[phase=on]/step:fill-primary/25"
            : "fill-subtle stroke-border [stroke-width:1]"
        }
      />
      <text x={x + 12} y={y + 12} textAnchor="middle" className={active ? "fill-primary font-mono text-[10px]" : "fill-muted-foreground font-mono text-[10px]"}>
        {label}
      </text>
    </>
  );
}

function TreeColumn({ x, title, path }: { x: number; title: string; path: string }) {
  return (
    <>
      <rect x={x} y={30} width={COL_W} height={180} rx={8} className="fill-foreground/[0.03] stroke-muted-foreground [stroke-width:1.1]" />
      <text x={x + COL_W / 2} y={54} textAnchor="middle" className={`${TEXT} font-semibold`}>
        {title}
      </text>
      <text x={x + COL_W / 2} y={71} textAnchor="middle" className={MONO_MUTED}>
        {path}
      </text>
      {["README.md", "app.ts"].map((file, i) => (
        <g key={file}>
          <rect x={x + 10} y={86 + i * 36} width={COL_W - 20} height={26} rx={4} className="fill-bg stroke-border [stroke-width:1]" />
          <text x={x + 18} y={103 + i * 36} className={MONO}>
            {file}
          </text>
          <VersionChip x={x + 84} y={91 + i * 36} label="v1" />
        </g>
      ))}
    </>
  );
}

const WT = 20;
const IDX = 245;
const REPO = 470;

export function ThreeTreesFigure() {
  return (
    <svg viewBox="0 0 640 280" role="img" aria-label={copy("treesAria")} className={SVG_CLASS}>
      <TreeColumn x={WT} title={copy("workingTree")} path="~/hanpaper" />
      <TreeColumn x={IDX} title={copy("index")} path=".git/index" />
      <TreeColumn x={REPO} title={copy("repository")} path=".git/objects" />
      <text x={REPO + COL_W / 2} y={172} textAnchor="middle" className={MONO_MUTED}>
        main → 4b1d0e3
      </text>

      <FigureStep at="edit">
        <VersionChip x={WT + 112} y={91} label="v2" active />
        <text x={WT + COL_W / 2} y={172} textAnchor="middle" className={`${SMALL} group-data-[phase=on]/step:fill-primary`}>
          {copy("modified")}
        </text>
      </FigureStep>

      <FigureStep at="add">
        <Arrow x1={WT + COL_W + 2} y1={99} x2={IDX - 3} y2={99} />
        <text x={(WT + COL_W + IDX) / 2} y={90} textAnchor="middle" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          git add
        </text>
        <VersionChip x={IDX + 112} y={91} label="v2" active />
        <text x={IDX + COL_W / 2} y={172} textAnchor="middle" className={MONO_MUTED}>
          blob 8a3f2c1
        </text>
      </FigureStep>

      <FigureStep at="commit">
        <Arrow x1={IDX + COL_W + 2} y1={99} x2={REPO - 3} y2={99} />
        <text x={(IDX + COL_W + REPO) / 2} y={90} textAnchor="middle" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          git commit
        </text>
        <VersionChip x={REPO + 112} y={91} label="v2" active />
        <text x={REPO + COL_W / 2} y={192} textAnchor="middle" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          {copy("newCommit")}
        </text>
      </FigureStep>

      <FigureStep at="restore">
        <PathArrow
          points={[
            [REPO + COL_W / 2, 212],
            [REPO + COL_W / 2, 238],
            [WT + COL_W / 2, 238],
            [WT + COL_W / 2, 213],
          ]}
        />
        <Arrow x1={IDX + COL_W / 2} y1={238} x2={IDX + COL_W / 2} y2={213} />
        <text x={IDX + COL_W / 2} y={262} textAnchor="middle" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          git restore / git switch
        </text>
      </FigureStep>
    </svg>
  );
}

// ── Figure 2: object model ──

export const OBJECTS_STEPS: ProcessStep[] = [
  { key: "blob", label: copy("objectsBlobLabel"), description: copy("objectsBlobDesc") },
  { key: "tree", label: copy("objectsTreeLabel"), description: copy("objectsTreeDesc") },
  { key: "commit", label: copy("objectsCommitLabel"), description: copy("objectsCommitDesc") },
  { key: "share", label: copy("objectsShareLabel"), description: copy("objectsShareDesc") },
];

type ObjectKind = "blob" | "tree" | "commit";

const KIND_FILL: Record<ObjectKind, string> = {
  blob: "fill-info-subtle",
  tree: "fill-success-subtle",
  commit: "fill-warning-subtle",
};

/** One Git object: a kind/id header and a few body lines. */
function GitObject({ x, y, kind, id, lines, h }: { x: number; y: number; kind: ObjectKind; id: string; lines: string[]; h: number }) {
  return (
    <>
      <rect x={x} y={y} width={160} height={h} rx={6} className={`${BOX} ${KIND_FILL[kind]}`} />
      <text x={x + 10} y={y + 18} className={`${MONO} font-semibold`}>
        {kind} <tspan className="fill-muted-foreground font-normal">{id}</tspan>
      </text>
      <path d={`M${x + 8} ${y + 25}H${x + 152}`} className="stroke-muted-foreground/40 [stroke-width:1]" />
      {lines.map((line, i) => (
        <text key={line} x={x + 10} y={y + 41 + i * 15} className={MONO_MUTED}>
          {line}
        </text>
      ))}
    </>
  );
}

export function ObjectModelFigure() {
  return (
    <svg viewBox="0 0 640 330" role="img" aria-label={copy("objectsAria")} className={SVG_CLASS}>
      <FigureStep at="blob">
        <GitObject x={460} y={24} h={56} kind="blob" id="8a3f2c1" lines={["# HanPaper"]} />
        <GitObject x={460} y={150} h={56} kind="blob" id="3c9e71d" lines={["export const app"]} />
      </FigureStep>

      <FigureStep at="tree">
        <GitObject x={240} y={24} h={72} kind="tree" id="9d41b07" lines={["100644 README.md", "040000 src/"]} />
        <GitObject x={240} y={150} h={56} kind="tree" id="1f07e5a" lines={["100644 app.ts"]} />
        <Arrow x1={402} y1={52} x2={457} y2={52} />
        <Arrow x1={320} y1={98} x2={320} y2={147} />
        <Arrow x1={402} y1={178} x2={457} y2={178} />
      </FigureStep>

      <FigureStep at="commit">
        <GitObject x={20} y={24} h={88} kind="commit" id="c7e2a91" lines={["tree 9d41b07", "parent 4b1d0e3", "author Lin"]} />
        <Arrow x1={182} y1={52} x2={237} y2={52} />
      </FigureStep>

      <FigureStep at="share">
        <GitObject x={20} y={250} h={72} kind="commit" id="e51a0f8" lines={["tree 77c2d14", "parent c7e2a91"]} />
        <GitObject x={240} y={250} h={72} kind="tree" id="77c2d14" lines={["100644 README.md", "040000 src/"]} />
        <GitObject x={460} y={250} h={56} kind="blob" id="d02b6e9" lines={["# HanPaper v2"]} />
        <Arrow x1={182} y1={278} x2={237} y2={278} />
        <Arrow x1={402} y1={278} x2={457} y2={278} />
        <Arrow x1={320} y1={248} x2={320} y2={209} />
        <Arrow x1={100} y1={248} x2={100} y2={115} />
        <text x={328} y={234} className={`${SMALL} group-data-[phase=on]/step:fill-primary`}>
          {copy("shared")}
        </text>
        <text x={108} y={185} className={SMALL}>
          parent
        </text>
      </FigureStep>
    </svg>
  );
}

// ── Commit graph primitives (figures 3 and 4) ──

const R = 15;

function Commit({ x, y, label, merge = false, rewritten = false }: { x: number; y: number; label: string; merge?: boolean; rewritten?: boolean }) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={R}
        className={`fill-bg ${BOX} ${rewritten ? "[stroke-dasharray:3_2]" : ""}`}
      />
      {merge ? <circle cx={x} cy={y} r={R - 4} className="fill-none stroke-muted-foreground [stroke-width:1] group-data-[phase=on]/step:stroke-primary" /> : null}
      <text x={x} y={y + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
        {label}
      </text>
    </>
  );
}

/** Edge between two commit circles, trimmed to their outlines. History reads left to right, so edges point at the newer commit. */
function Edge({ from, to, flow = false }: { from: [number, number]; to: [number, number]; flow?: boolean }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const sx = x1 + (R + 1) * Math.cos(angle);
  const sy = y1 + (R + 1) * Math.sin(angle);
  const ex = x2 - (R + 2) * Math.cos(angle);
  const ey = y2 - (R + 2) * Math.sin(angle);
  return <Arrow x1={sx} y1={sy} x2={ex} y2={ey} flow={flow} />;
}

/** A ref label (branch name) attached to a commit from below or above. */
function Ref({ x, y, label, side = "below" }: { x: number; y: number; label: string; side?: "below" | "above" }) {
  const top = side === "below" ? y + R + 12 : y - R - 32;
  const lineFrom = side === "below" ? y + R + 1 : y - R - 1;
  const lineTo = side === "below" ? top : top + 20;
  const w = label.length * 7 + 18;
  return (
    <>
      <path d={`M${x} ${lineFrom}V${lineTo}`} className="stroke-muted-foreground [stroke-width:1] group-data-[phase=on]/step:stroke-primary" />
      <rect x={x - w / 2} y={top} width={w} height={20} rx={10} className="fill-subtle stroke-muted-foreground [stroke-width:1] group-data-[phase=on]/step:fill-primary group-data-[phase=on]/step:stroke-primary" />
      <text x={x} y={top + 14} textAnchor="middle" className="fill-foreground font-mono text-[11px] group-data-[phase=on]/step:fill-primary-foreground">
        {label}
      </text>
    </>
  );
}

const MAIN_Y = 140;
const FEAT_Y = 62;
const C1: [number, number] = [70, MAIN_Y];
const C2: [number, number] = [170, MAIN_Y];
const C3: [number, number] = [270, MAIN_Y];
const F1: [number, number] = [270, FEAT_Y];
const F2: [number, number] = [370, FEAT_Y];

// ── Figure 3: branching and merging ──

export const BRANCH_STEPS: ProcessStep[] = [
  { key: "main", label: copy("branchMainLabel"), description: copy("branchMainDesc") },
  { key: "feature", label: copy("branchFeatureLabel"), description: copy("branchFeatureDesc") },
  { key: "diverge", label: copy("branchDivergeLabel"), description: copy("branchDivergeDesc") },
  { key: "base", label: copy("branchBaseLabel"), description: copy("branchBaseDesc") },
  { key: "merge", label: copy("branchMergeLabel"), description: copy("branchMergeDesc") },
];

const M: [number, number] = [480, MAIN_Y];

export function BranchMergeFigure() {
  return (
    <svg viewBox="0 0 640 220" role="img" aria-label={copy("branchAria")} className={SVG_CLASS}>
      <FigureStep at="main">
        <Edge from={C1} to={C2} />
        <Commit x={C1[0]} y={C1[1]} label="C1" />
        <Commit x={C2[0]} y={C2[1]} label="C2" />
      </FigureStep>
      <FigureStep at="main" until="diverge">
        <Ref x={C2[0]} y={C2[1]} label="main" />
      </FigureStep>

      <FigureStep at="feature">
        <Edge from={C2} to={F1} flow />
        <Edge from={F1} to={F2} flow />
        <Commit x={F1[0]} y={F1[1]} label="F1" />
        <Commit x={F2[0]} y={F2[1]} label="F2" />
        <Ref x={F2[0]} y={F2[1]} label="feature" side="above" />
      </FigureStep>

      <FigureStep at="diverge">
        <Edge from={C2} to={C3} flow />
        <Commit x={C3[0]} y={C3[1]} label="C3" />
      </FigureStep>
      <FigureStep at="diverge" until="merge">
        <Ref x={C3[0]} y={C3[1]} label="main" />
      </FigureStep>

      <FigureStep at="base">
        <circle cx={C2[0]} cy={C2[1]} r={R + 7} className="fill-none stroke-muted-foreground [stroke-dasharray:4_3] [stroke-width:1.3] group-data-[phase=on]/step:stroke-primary" />
        <text x={C2[0] - 22} y={C2[1] - 30} textAnchor="middle" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          merge-base
        </text>
      </FigureStep>

      <FigureStep at="merge">
        <Edge from={C3} to={M} flow />
        <Edge from={F2} to={M} flow />
        <Commit x={M[0]} y={M[1]} label="M" merge />
        <Ref x={M[0]} y={M[1]} label="main" />
      </FigureStep>
    </svg>
  );
}

// ── Figure 4: rebase ──

export const REBASE_STEPS: ProcessStep[] = [
  { key: "start", label: copy("rebaseStartLabel"), description: copy("rebaseStartDesc") },
  { key: "pick", label: copy("rebasePickLabel"), description: copy("rebasePickDesc") },
  { key: "replay", label: copy("rebaseReplayLabel"), description: copy("rebaseReplayDesc") },
  { key: "move", label: copy("rebaseMoveLabel"), description: copy("rebaseMoveDesc") },
];

const F1R: [number, number] = [380, MAIN_Y];
const F2R: [number, number] = [480, MAIN_Y];

export function RebaseFigure() {
  return (
    <svg viewBox="0 0 640 220" role="img" aria-label={copy("rebaseAria")} className={SVG_CLASS}>
      <FigureStep at="start">
        <Edge from={C1} to={C2} />
        <Edge from={C2} to={C3} />
        <Commit x={C1[0]} y={C1[1]} label="C1" />
        <Commit x={C2[0]} y={C2[1]} label="C2" />
        <Commit x={C3[0]} y={C3[1]} label="C3" />
        <Ref x={C3[0]} y={C3[1]} label="main" />
      </FigureStep>

      <FigureStep at="start pick">
        <Edge from={C2} to={F1} />
        <Edge from={F1} to={F2} />
        <Commit x={F1[0]} y={F1[1]} label="F1" />
        <Commit x={F2[0]} y={F2[1]} label="F2" />
      </FigureStep>
      <FigureStep at="start" until="move">
        <Ref x={F2[0]} y={F2[1]} label="feature" side="above" />
      </FigureStep>

      <FigureStep at="pick">
        <rect x={F1[0] - 30} y={FEAT_Y - 26} width={F2[0] - F1[0] + 60} height={52} rx={26} className="fill-primary/5 stroke-muted-foreground [stroke-dasharray:4_3] [stroke-width:1.2] group-data-[phase=on]/step:stroke-primary" />
        <text x={F1[0] - 36} y={FEAT_Y + 4} textAnchor="end" className={`${MONO} group-data-[phase=on]/step:fill-primary`}>
          C2..feature
        </text>
      </FigureStep>

      <FigureStep at="replay">
        <Edge from={C3} to={F1R} />
        <Edge from={F1R} to={F2R} />
        <Arrow x1={F1[0] + 12} y1={F1[1] + 11} x2={F1R[0] - 11} y2={F1R[1] - 13} />
        <Arrow x1={F2[0] + 12} y1={F2[1] + 11} x2={F2R[0] - 11} y2={F2R[1] - 13} />
        <Commit x={F1R[0]} y={F1R[1]} label="F1′" rewritten />
        <Commit x={F2R[0]} y={F2R[1]} label="F2′" rewritten />
      </FigureStep>

      <FigureStep at="move">
        <Ref x={F2R[0]} y={F2R[1]} label="feature" />
        <text x={F2[0] + 26} y={FEAT_Y + 4} className={`${SMALL} group-data-[phase=on]/step:fill-primary`}>
          {copy("unreachable")}
        </text>
      </FigureStep>
    </svg>
  );
}

// ── Figure 5: packfile model (parametric) ──

export interface PackState {
  /** number of revisions */
  n: number;
  /** fraction of the file changed per revision, 0..1 */
  r: number;
}

export const PACK_STATES: Record<string, PackState> = {
  few: { n: 10, r: 0.05 },
  many: { n: 120, r: 0.05 },
  heavy: { n: 120, r: 0.4 },
};

/** Size model, in KB. File S = 40 KB, zlib ratio c = 0.35, per-delta overhead 0.2 KB. */
const S = 40;
const C = 0.35;
const OVERHEAD = 0.2;
export const looseSize = (n: number) => n * C * S;
export const packedSize = (n: number, r: number) => C * S + Math.max(0, n - 1) * (C * r * S + OVERHEAD);

export function formatKb(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(kb < 100 ? 1 : 0)} KB`;
}

export function describePack({ n, r }: PackState) {
  const loose = looseSize(n);
  const packed = packedSize(n, r);
  return copy("packDescribe", n, Math.round(r * 100), formatKb(loose), formatKb(packed), (loose / packed).toFixed(1));
}

const PLOT = { x: 64, y: 20, w: 520, h: 200 };
const MAX_N = 200;

const Y_MAX = 3 * 1024;
const Y_TICKS = [0, 1024, 2048, 3072];

export function PackChart({ state }: { state: PackState }) {
  const { n, r } = state;
  const sx = (i: number) => PLOT.x + ((i - 1) / (MAX_N - 1)) * PLOT.w;
  const sy = (kb: number) => PLOT.y + PLOT.h - (kb / Y_MAX) * PLOT.h;
  const xTicks = [1, 50, 100, 150, 200];
  const loose = looseSize(n);
  const packed = packedSize(n, r);
  const legend = [
    { label: copy("looseSeries"), className: "fill-chart-3" },
    { label: copy("packedSeries"), className: "fill-chart-1" },
  ];
  return (
    <svg viewBox="0 0 640 270" role="img" aria-label={copy("packAria")} className={SVG_CLASS}>
      {Y_TICKS.map((t) => (
        <g key={t}>
          <path d={`M${PLOT.x} ${sy(t)}H${PLOT.x + PLOT.w}`} className="stroke-border [stroke-width:1]" />
          <text x={PLOT.x - 8} y={sy(t) + 4} textAnchor="end" className={SMALL}>
            {t === 0 ? "0" : `${t / 1024} MB`}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={sx(t)} y={PLOT.y + PLOT.h + 16} textAnchor="middle" className={SMALL}>
          {t}
        </text>
      ))}
      <text x={PLOT.x + PLOT.w / 2} y={262} textAnchor="middle" className={SMALL}>
        {copy("revisions")}
      </text>
      <text x={14} y={PLOT.y + PLOT.h / 2} textAnchor="middle" transform={`rotate(-90 14 ${PLOT.y + PLOT.h / 2})`} className={SMALL}>
        {copy("cumulativeSize")}
      </text>
      {legend.map((item, i) => (
        <g key={item.label}>
          <rect x={PLOT.x + 12} y={PLOT.y + 8 + i * 18} width={14} height={4} rx={2} className={item.className} />
          <text x={PLOT.x + 32} y={PLOT.y + 14 + i * 18} className="fill-foreground text-[11px]">
            {item.label}
          </text>
        </g>
      ))}

      {/* beyond n each line is drawn faint: what further revisions would cost */}
      <path d={`M${sx(1)} ${sy(looseSize(1))}L${sx(MAX_N)} ${sy(looseSize(MAX_N))}`} className="fill-none stroke-chart-3/30 [stroke-width:2]" />
      <path d={`M${sx(1)} ${sy(packedSize(1, r))}L${sx(MAX_N)} ${sy(packedSize(MAX_N, r))}`} className="fill-none stroke-chart-1/30 [stroke-width:2]" />
      <path d={`M${sx(1)} ${sy(looseSize(1))}L${sx(n)} ${sy(loose)}`} className="fill-none stroke-chart-3 [stroke-width:2.5]" />
      <path d={`M${sx(1)} ${sy(packedSize(1, r))}L${sx(n)} ${sy(packed)}`} className="fill-none stroke-chart-1 [stroke-width:2.5]" />
      <path d={`M${sx(n)} ${PLOT.y}V${PLOT.y + PLOT.h}`} className="stroke-muted-foreground [stroke-dasharray:3_3] [stroke-width:1]" />
      <circle cx={sx(n)} cy={sy(loose)} r={4} className="fill-chart-3" />
      <circle cx={sx(n)} cy={sy(packed)} r={4} className="fill-chart-1" />
    </svg>
  );
}

const RATIOS = [0.02, 0.05, 0.1, 0.4];

/** Controls under the pack figure. Hovering them lights up the matching terms of Eq. (2). */
export function PackControls({ state, setState }: { state: PackState; setState: (s: PackState) => void }) {
  const nTerm = usePaperTerm("n");
  const rTerm = usePaperTerm("r");
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-sm">
      <label {...nTerm.bind} className="flex min-w-60 flex-1 items-center gap-3 rounded-sm data-[active]:text-primary">
        <span className="shrink-0">{copy("packRevisionsSlider")}</span>
        <Slider
          aria-label={copy("packRevisionsSlider")}
          min={2}
          max={MAX_N}
          value={state.n}
          onValueChange={(v) => setState({ ...state, n: Array.isArray(v) ? v[0] : (v as number) })}
          className="flex-1"
        />
        <span className="w-8 shrink-0 text-right tabular-nums">{state.n}</span>
      </label>
      <div {...rTerm.bind} className="flex items-center gap-3 rounded-sm data-[active]:text-primary">
        <span>{copy("packChangeRatio")}</span>
        <Segmented
          size="sm"
          aria-label={copy("packChangeRatio")}
          value={String(state.r)}
          onValueChange={(v) => setState({ ...state, r: Number(v) })}
          items={RATIOS.map((r) => ({ value: String(r), label: `${Math.round(r * 100)}%` }))}
        />
      </div>
    </div>
  );
}

// ── Figure wrappers used by the paper ──

export function ThreeTreesProcess({ id = "fig-trees", defaultState }: { id?: string; defaultState?: string }) {
  return (
    <ProcessFigure id={id} steps={TREES_STEPS} caption={copy("treesCaption")} overviewDescription={copy("treesOverview")} defaultState={defaultState}>
      <ThreeTreesFigure />
    </ProcessFigure>
  );
}

export function ObjectModelProcess({ id = "fig-objects", defaultState }: { id?: string; defaultState?: string }) {
  return (
    <ProcessFigure id={id} steps={OBJECTS_STEPS} caption={copy("objectsCaption")} overviewDescription={copy("objectsOverview")} defaultState={defaultState}>
      <ObjectModelFigure />
    </ProcessFigure>
  );
}

export function BranchMergeProcess({ id = "fig-branch", defaultState }: { id?: string; defaultState?: string }) {
  return (
    <ProcessFigure id={id} steps={BRANCH_STEPS} caption={copy("branchCaption")} overviewDescription={copy("branchOverview")} defaultState={defaultState}>
      <BranchMergeFigure />
    </ProcessFigure>
  );
}

export function RebaseProcess({ id = "fig-rebase", defaultState }: { id?: string; defaultState?: string }) {
  return (
    <ProcessFigure id={id} steps={REBASE_STEPS} caption={copy("rebaseCaption")} overviewDescription={copy("rebaseOverview")} defaultState={defaultState}>
      <RebaseFigure />
    </ProcessFigure>
  );
}

export function PackFigure({ id = "fig-pack" }: { id?: string }) {
  return (
    <PaperFigure<PackState>
      id={id}
      states={PACK_STATES}
      defaultState="many"
      printState="many"
      printSubfigures={["few", "many", "heavy"]}
      caption={copy("packCaption")}
      describe={(s) => describePack(s)}
      controls={(fig) => <PackControls state={fig.state} setState={fig.setState} />}
    >
      {(state) => <PackChart state={state} />}
    </PaperFigure>
  );
}

/** Every figure of the Git paper, in document order: export drawer and figure studio read this. */
export const GIT_FIGURES: { id: string; caption: string; keys: { key: string; label: string }[] }[] = [
  { id: "fig-trees", caption: copy("treesCaption"), keys: TREES_STEPS.map((s) => ({ key: s.key, label: s.label })) },
  { id: "fig-objects", caption: copy("objectsCaption"), keys: OBJECTS_STEPS.map((s) => ({ key: s.key, label: s.label })) },
  { id: "fig-branch", caption: copy("branchCaption"), keys: BRANCH_STEPS.map((s) => ({ key: s.key, label: s.label })) },
  { id: "fig-rebase", caption: copy("rebaseCaption"), keys: REBASE_STEPS.map((s) => ({ key: s.key, label: s.label })) },
  {
    id: "fig-pack",
    caption: copy("packCaption"),
    keys: Object.entries(PACK_STATES).map(([key, s]) => ({ key, label: `n=${s.n}, r=${Math.round(s.r * 100)}%` })),
  },
];
