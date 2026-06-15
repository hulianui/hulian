import type { ShowcaseSpec } from "../showcase/types";
import { ScoreRing } from "./score-ring";

export const scoreRingShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "value 驱动环进度与中心数字，默认满分 100、显示 A-F 等级字。",
      code: `<ScoreRing value={82} label="质量分" />`,
      render: () => <ScoreRing value={82} label="质量分" />,
    },
    {
      title: "等级带",
      description: "默认 A-F 等级带按分值自动取色：A 优秀 / B 良好 / C 及格 / F 不及格。",
      code: `<>
  <ScoreRing value={95} label="质量分" />
  <ScoreRing value={82} label="质量分" />
  <ScoreRing value={68} label="质量分" />
  <ScoreRing value={42} label="质量分" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-4">
          <ScoreRing value={95} label="质量分" />
          <ScoreRing value={82} label="质量分" />
          <ScoreRing value={68} label="质量分" />
          <ScoreRing value={42} label="质量分" />
        </div>
      ),
    },
    {
      title: "尺寸与环宽",
      description: "size 控直径、thickness 控环宽；小尺寸可 showGrade={false} 只留数字。",
      code: `<>
  <ScoreRing value={88} size={48} thickness={5} showGrade={false} />
  <ScoreRing value={88} size={96} thickness={8} label="质量分" />
  <ScoreRing value={88} size={128} thickness={12} label="质量分" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-4">
          <ScoreRing value={88} size={48} thickness={5} showGrade={false} />
          <ScoreRing value={88} size={96} thickness={8} label="质量分" />
          <ScoreRing value={88} size={128} thickness={12} label="质量分" />
        </div>
      ),
    },
  ],
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
