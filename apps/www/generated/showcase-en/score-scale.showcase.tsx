import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import type { Grade } from "../../../../packages/ui/src/score-ring/score-ring.grade";
import { Stat } from "../../../../packages/ui/src/stat/stat";
import { ScoreScale } from "../../../../packages/ui/src/score-scale/score-scale";
const CREDIT_GRADES: Grade[] = [
    { min: 80, label: "Excellent", tone: "success" },
    { min: 60, label: "Good", tone: "chart-2" },
    { min: 30, label: "Fair", tone: "warning" },
    { min: 0, label: "Poor", tone: "danger" },
];
export const scoreScaleShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The whole range is tinted band by band and the cursor stops where value lands; it defaults to a maximum of 100 with the A-F bands.",
            code: `<ScoreScale value={73} label="Quality score" />`,
            render: () => (<div className="w-80">
          <ScoreScale value={73} label="Quality points"/>
        </div>),
        },
        {
            title: "Custom grade bands",
            description: "The distance between two adjacent min values is that band's width on the bar: 0-29 Poor and 30-59 Fair take 30% each, the other two take 20% each.",
            code: `const CREDIT_GRADES = [
  { min: 80, label: "Excellent", tone: "success" },
  { min: 60, label: "Good", tone: "chart-2" },
  { min: 30, label: "Fair", tone: "warning" },
  { min: 0, label: "Poor", tone: "danger" },
]

<ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} showRange />`,
            render: () => (<div className="w-80">
          <ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} showRange/>
        </div>),
        },
        {
            title: "Compose a whole score card",
            description: "The four slots of Stat line up exactly: label is the title, value the score, chart this bar, and hint the closing note.",
            code: `<Stat
  label="Credit score"
  value={<span className="text-6xl font-bold tabular-nums">36</span>}
  chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false} />}
  hint="Fair credit. Complete your documents before requesting a higher limit."
/>`,
            render: () => (<Stat className="w-80" label="Credit score" value={<span className="text-6xl font-bold tabular-nums">36</span>} chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false}/>} hint="Fair credit. Complete your documents before requesting a higher limit."/>),
        },
        {
            title: "Size",
            description: "sm suits table rows and dense panels, md suits the star of a score card.",
            code: `<>
  <ScoreScale value={73} size="sm" label="Quality score" />
  <ScoreScale value={73} size="md" label="Quality score" />
</>`,
            render: () => (<div className="flex w-80 flex-col gap-4">
          <ScoreScale value={73} size="sm" label="Quality points"/>
          <ScoreScale value={73} size="md" label="Quality points"/>
        </div>),
        },
        {
            title: "Gaps between bands",
            description: "By default the bands sit flush and are told apart by hue alone; when neighbouring bands share one color (A and B are both green in the default A-F set), only segmentGap tells them apart.",
            code: `<ScoreScale value={73} label="Quality score" segmentGap />`,
            render: () => (<div className="flex w-80 flex-col gap-4">
          <ScoreScale value={73} label="Quality points"/>
          <ScoreScale value={73} label="Quality points" segmentGap/>
        </div>),
        },
        {
            title: "Reference lines",
            description: "markers draw comparison values on the bar; the cursor is not the only marker on it.",
            code: `<ScoreScale
  value={36}
  label="Credit score"
  grades={CREDIT_GRADES}
  markers={[{ value: 62, label: "Industry average 62" }]}
/>`,
            render: () => (<div className="w-80">
          <ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} markers={[{ value: 62, label: "Industry average 62" }]}/>
        </div>),
        },
        {
            title: "Clamped out-of-range values",
            description: "A value beyond the range clamps the cursor to an endpoint; screen readers still read the original number rather than pretending it fits.",
            code: `<ScoreScale value={137} label="Credit score" grades={CREDIT_GRADES} showRange />`,
            render: () => (<div className="w-80">
          <ScoreScale value={137} label="Credit score" grades={CREDIT_GRADES} showRange/>
        </div>),
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 36, label: "Score" },
        { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md", label: "Size" },
        { prop: "showGrade", type: "boolean", defaultValue: true, label: "Show level" },
        { prop: "showRange", type: "boolean", defaultValue: true, label: "Show range" },
        { prop: "segmentGap", type: "boolean", defaultValue: false, label: "Gaps between bands" },
    ],
    states: [
        {
            name: "Poor",
            render: () => (<div className="w-72">
          <ScoreScale value={22} label="Credit score" grades={CREDIT_GRADES} showRange/>
        </div>),
        },
        {
            name: "Fair",
            render: () => (<div className="w-72">
          <ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} showRange/>
        </div>),
        },
        {
            name: "Excellent",
            render: () => (<div className="w-72">
          <ScoreScale value={92} label="Credit score" grades={CREDIT_GRADES} showRange/>
        </div>),
        },
        {
            name: "With a reference line",
            render: () => (<div className="w-72">
          <ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} markers={[{ value: 62, label: "Industry average 62" }]}/>
        </div>),
        },
        {
            name: "Small size",
            render: () => (<div className="w-72">
          <ScoreScale value={73} size="sm" label="Quality points"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-80">
      <ScoreScale value={Number(p.value)} size={p.size as "sm" | "md"} showGrade={p.showGrade as boolean} showRange={p.showRange as boolean} segmentGap={p.segmentGap as boolean} label="Credit score" grades={CREDIT_GRADES}/>
    </div>),
    toCode: (p) => `<ScoreScale value={${Number(p.value)}} size="${String(p.size)}"${p.showGrade ? "" : " showGrade={false}"}${p.showRange ? " showRange" : ""}${p.segmentGap ? " segmentGap" : ""} label="Credit score" grades={CREDIT_GRADES} />`,
};
