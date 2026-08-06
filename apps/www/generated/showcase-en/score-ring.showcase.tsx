import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ScoreRing } from "../../../../packages/ui/src/score-ring/score-ring";
export const scoreRingShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "value drive ring progress and center number, the default score is 100, and the A-F level word is displayed.",
            code: `<ScoreRing value={82} label="Quality Points" />`,
            render: () => <ScoreRing value={82} label="Quality points"/>,
        },
        {
            title: "Grade bands",
            description: "The default A-F grade is automatically selected according to the score: A excellent / B good / C passing / F failing.",
            code: `<>
  <ScoreRing value={95} label="Quality Points" />
  <ScoreRing value={82} label="Quality Points" />
  <ScoreRing value={68} label="Quality Points" />
  <ScoreRing value={42} label="Quality Points" />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-4">
          <ScoreRing value={95} label="Quality points"/>
          <ScoreRing value={82} label="Quality points"/>
          <ScoreRing value={68} label="Quality points"/>
          <ScoreRing value={42} label="Quality points"/>
        </div>),
        },
        {
            title: "Size and ring width",
            description: "size controls the diameter, thickness controls the ring width; for small sizes, showGrade={false} only leaves numbers.",
            code: `<>
  <ScoreRing value={88} size={48} thickness={5} showGrade={false} />
  <ScoreRing value={88} size={96} thickness={8} label="Quality Points" />
  <ScoreRing value={88} size={128} thickness={12} label="Quality Score" />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-4">
          <ScoreRing value={88} size={48} thickness={5} showGrade={false}/>
          <ScoreRing value={88} size={96} thickness={8} label="Quality points"/>
          <ScoreRing value={88} size={128} thickness={12} label="Quality points"/>
        </div>),
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 82, label: "Score" },
        { prop: "size", type: "number", defaultValue: 96, label: "Diameter" },
        { prop: "thickness", type: "number", defaultValue: 8, label: "Ring width" },
        { prop: "showGrade", type: "boolean", defaultValue: true, label: "Show level" },
    ],
    states: [
        { name: "A Excellent", render: () => <ScoreRing value={95} label="Quality points"/> },
        { name: "B Good", render: () => <ScoreRing value={82} label="Quality points"/> },
        { name: "C Passed", render: () => <ScoreRing value={68} label="Quality points"/> },
        { name: "F failed", render: () => <ScoreRing value={42} label="Quality points"/> },
        { name: "Small size mini", render: () => <ScoreRing value={88} size={48} thickness={5} showGrade={false}/> },
    ],
    renderWithProps: (p) => (<ScoreRing value={Number(p.value)} size={Number(p.size)} thickness={Number(p.thickness)} showGrade={p.showGrade as boolean} label="Quality points"/>),
    toCode: (p) => `<ScoreRing value={${Number(p.value)}} size={${Number(p.size)}} thickness={${Number(p.thickness)}}${p.showGrade ? "" : " showGrade={false}"} label="Quality Points" />`,
};
