import type { ShowcaseSpec } from "../showcase/types";
import type { Grade } from "../score-ring/score-ring.grade";
import { Stat } from "../stat/stat";
import { ScoreScale } from "./score-scale";

const CREDIT_GRADES: Grade[] = [
  { min: 80, label: "优秀", tone: "success" },
  { min: 60, label: "良好", tone: "chart-2" },
  { min: 30, label: "一般", tone: "warning" },
  { min: 0, label: "差", tone: "danger" },
];

export const scoreScaleShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "整条量程按等级带着色，游标停在 value 所在的位置；默认满分 100、A-F 等级带。",
      code: `<ScoreScale value={73} label="质量分" />`,
      render: () => (
        <div className="w-80">
          <ScoreScale value={73} label="质量分" />
        </div>
      ),
    },
    {
      title: "自定义等级带",
      description: "相邻两档 min 之差就是该段在条上的宽度：0-29 差与 30-59 一般各占 30%，其余两档各占 20%。",
      code: `const CREDIT_GRADES = [
  { min: 80, label: "优秀", tone: "success" },
  { min: 60, label: "良好", tone: "chart-2" },
  { min: 30, label: "一般", tone: "warning" },
  { min: 0, label: "差", tone: "danger" },
]

<ScoreScale value={36} label="信誉评分" grades={CREDIT_GRADES} showRange />`,
      render: () => (
        <div className="w-80">
          <ScoreScale value={36} label="信誉评分" grades={CREDIT_GRADES} showRange />
        </div>
      ),
    },
    {
      title: "拼成整张评分卡",
      description: "Stat 的四个槽正好对上：label 标题、value 分值、chart 这条尺、hint 底部释义。",
      code: `<Stat
  label="信誉评分"
  value={<span className="text-6xl font-bold tabular-nums">36</span>}
  chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false} />}
  hint="信誉一般，建议先补齐资质材料后再申请提额。"
/>`,
      render: () => (
        <Stat
          className="w-80"
          label="信誉评分"
          value={<span className="text-6xl font-bold tabular-nums">36</span>}
          chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false} />}
          hint="信誉一般，建议先补齐资质材料后再申请提额。"
        />
      ),
    },
    {
      title: "尺寸",
      description: "sm 适合表格行内与密集面板，md 适合评分卡主角。",
      code: `<>
  <ScoreScale value={73} size="sm" label="质量分" />
  <ScoreScale value={73} size="md" label="质量分" />
</>`,
      render: () => (
        <div className="flex w-80 flex-col gap-4">
          <ScoreScale value={73} size="sm" label="质量分" />
          <ScoreScale value={73} size="md" label="质量分" />
        </div>
      ),
    },
    {
      title: "段间留缝",
      description: "默认四段紧邻只靠色相切分；相邻档同色时（默认 A-F 里 A/B 同绿）开 segmentGap 才分得出档。",
      code: `<ScoreScale value={73} label="质量分" segmentGap />`,
      render: () => (
        <div className="flex w-80 flex-col gap-4">
          <ScoreScale value={73} label="质量分" />
          <ScoreScale value={73} label="质量分" segmentGap />
        </div>
      ),
    },
    {
      title: "参照线",
      description: "markers 在条上画对照值，游标不是条上唯一的标记物。",
      code: `<ScoreScale
  value={36}
  label="信誉评分"
  grades={CREDIT_GRADES}
  markers={[{ value: 62, label: "行业均值 62" }]}
/>`,
      render: () => (
        <div className="w-80">
          <ScoreScale
            value={36}
            label="信誉评分"
            grades={CREDIT_GRADES}
            markers={[{ value: 62, label: "行业均值 62" }]}
          />
        </div>
      ),
    },
    {
      title: "越界夹紧",
      description: "超出量程的值把游标夹到端点；读屏念的仍是原始值，不假装它没超。",
      code: `<ScoreScale value={137} label="信誉评分" grades={CREDIT_GRADES} showRange />`,
      render: () => (
        <div className="w-80">
          <ScoreScale value={137} label="信誉评分" grades={CREDIT_GRADES} showRange />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "value", type: "number", defaultValue: 36, label: "分值" },
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md", label: "尺寸" },
    { prop: "showGrade", type: "boolean", defaultValue: true, label: "显示等级" },
    { prop: "showRange", type: "boolean", defaultValue: true, label: "显示量程" },
    { prop: "segmentGap", type: "boolean", defaultValue: false, label: "段间留缝" },
  ],
  states: [
    {
      name: "差",
      render: () => (
        <div className="w-72">
          <ScoreScale value={22} label="信誉评分" grades={CREDIT_GRADES} showRange />
        </div>
      ),
    },
    {
      name: "一般",
      render: () => (
        <div className="w-72">
          <ScoreScale value={36} label="信誉评分" grades={CREDIT_GRADES} showRange />
        </div>
      ),
    },
    {
      name: "优秀",
      render: () => (
        <div className="w-72">
          <ScoreScale value={92} label="信誉评分" grades={CREDIT_GRADES} showRange />
        </div>
      ),
    },
    {
      name: "带参照线",
      render: () => (
        <div className="w-72">
          <ScoreScale
            value={36}
            label="信誉评分"
            grades={CREDIT_GRADES}
            markers={[{ value: 62, label: "行业均值 62" }]}
          />
        </div>
      ),
    },
    {
      name: "小尺寸",
      render: () => (
        <div className="w-72">
          <ScoreScale value={73} size="sm" label="质量分" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-80">
      <ScoreScale
        value={Number(p.value)}
        size={p.size as "sm" | "md"}
        showGrade={p.showGrade as boolean}
        showRange={p.showRange as boolean}
        segmentGap={p.segmentGap as boolean}
        label="信誉评分"
        grades={CREDIT_GRADES}
      />
    </div>
  ),
  toCode: (p) =>
    `<ScoreScale value={${Number(p.value)}} size="${String(p.size)}"${p.showGrade ? "" : " showGrade={false}"}${p.showRange ? " showRange" : ""}${p.segmentGap ? " segmentGap" : ""} label="信誉评分" grades={CREDIT_GRADES} />`,
};
