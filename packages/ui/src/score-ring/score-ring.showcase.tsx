import type { ShowcaseSpec } from "../showcase/types";
import { ScoreRing } from "./score-ring";

export const scoreRingShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 82, label: "分值" },
    { prop: "size", type: "number", defaultValue: 96, label: "直径" },
    { prop: "thickness", type: "number", defaultValue: 8, label: "环宽" },
    { prop: "showGrade", type: "boolean", defaultValue: true, label: "显示等级" },
  ],
  states: [
    { name: "A 优秀", render: () => <ScoreRing value={95} label="质量分" /> },
    { name: "B 良好", render: () => <ScoreRing value={82} label="质量分" /> },
    { name: "C 及格", render: () => <ScoreRing value={68} label="质量分" /> },
    { name: "F 不及格", render: () => <ScoreRing value={42} label="质量分" /> },
    { name: "小尺寸迷你", render: () => <ScoreRing value={88} size={48} thickness={5} showGrade={false} /> },
  ],
  renderWithProps: (p) => (
    <ScoreRing
      value={Number(p.value)}
      size={Number(p.size)}
      thickness={Number(p.thickness)}
      showGrade={p.showGrade as boolean}
      label="质量分"
    />
  ),
  toCode: (p) =>
    `<ScoreRing value={${Number(p.value)}} size={${Number(p.size)}} thickness={${Number(p.thickness)}}${p.showGrade ? "" : " showGrade={false}"} label="质量分" />`,
};
