"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Funnel } from "./funnel";
import type { FunnelStage } from "./funnel.types";

const taskStages: FunnelStage[] = [
  { id: "in", label: "涌入", value: 1240, tone: "brand" },
  { id: "route", label: "路由", value: 1080, tone: "brand" },
  { id: "exec", label: "执行", value: 860, tone: "warning" },
  { id: "done", label: "完成", value: 720, tone: "success" },
];

const conversionStages: FunnelStage[] = [
  { id: "visit", label: "访问", value: 8600, tone: "brand" },
  { id: "signup", label: "注册", value: 4200, tone: "brand" },
  { id: "trial", label: "试用", value: 1900, tone: "warning" },
  { id: "pay", label: "付费", value: 640, tone: "success" },
];

function VerticalDemo({ showConversion = true }: { showConversion?: boolean }) {
  return (
    <div className="w-full max-w-md">
      <Funnel
        stages={taskStages}
        orientation="vertical"
        showConversion={showConversion}
        ariaLabel="漏斗图"
        conversionLabel="转化"
      />
    </div>
  );
}

function HorizontalDemo() {
  return (
    <div className="w-full max-w-lg">
      <Funnel
        stages={conversionStages}
        orientation="horizontal"
        ariaLabel="漏斗图"
        conversionLabel="转化"
      />
    </div>
  );
}

export const funnelShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（vertical）",
      description:
        "每级一行，居中条按 value 比例缩放宽度，级间默认显示转化率徽标。per-stage tone 吃 token。",
      code: `<Funnel
  stages={[
    { id: "in", label: "涌入", value: 1240, tone: "brand" },
    { id: "route", label: "路由", value: 1080, tone: "brand" },
    { id: "exec", label: "执行", value: 860, tone: "warning" },
    { id: "done", label: "完成", value: 720, tone: "success" },
  ]}
  ariaLabel="漏斗图"
  conversionLabel="转化"
/>`,
      render: () => <VerticalDemo />,
    },
    {
      title: "横向（horizontal）",
      description: "每列一阶段，按 value 比例缩放高度，适合转化漏斗。",
      code: `<Funnel
  stages={[
    { id: "visit", label: "访问", value: 8600, tone: "brand" },
    { id: "signup", label: "注册", value: 4200, tone: "brand" },
    { id: "trial", label: "试用", value: 1900, tone: "warning" },
    { id: "pay", label: "付费", value: 640, tone: "success" },
  ]}
  orientation="horizontal"
  ariaLabel="漏斗图"
  conversionLabel="转化"
/>`,
      render: () => <HorizontalDemo />,
    },
    {
      title: "隐藏转化率徽标",
      description: "showConversion={false} 关闭级间转化率，只看体量。",
      code: `<Funnel
  stages={stages}
  showConversion={false}
  ariaLabel="漏斗图"
  conversionLabel="转化"
/>`,
      render: () => <VerticalDemo showConversion={false} />,
    },
    {
      title: "可点击下钻",
      description: "传 onStageClick 后条变为按钮，点击回吐该阶段用于下钻。",
      code: `<Funnel
  stages={stages}
  ariaLabel="漏斗图"
  conversionLabel="转化"
  onStageClick={(s) => console.log(s.id)}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <Funnel
            stages={taskStages}
            ariaLabel="漏斗图"
            conversionLabel="转化"
            onStageClick={() => {}}
          />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "orientation",
      type: "select",
      options: ["vertical", "horizontal"],
      defaultValue: "vertical",
      label: "方向",
    },
    { prop: "showConversion", type: "boolean", defaultValue: true, label: "级间转化率" },
  ],
  states: [
    {
      name: "任务漏斗（vertical · 涌入 → 路由 → 执行 → 完成）",
      render: () => <VerticalDemo />,
    },
    {
      name: "转化漏斗（horizontal · 访问 → 注册 → 试用 → 付费）",
      render: () => <HorizontalDemo />,
    },
    {
      name: "隐藏转化率徽标",
      render: () => <VerticalDemo showConversion={false} />,
    },
  ],
  renderWithProps: (p) => {
    const orientation = (p.orientation as "vertical" | "horizontal") ?? "vertical";
    const stages = orientation === "horizontal" ? conversionStages : taskStages;
    return (
      <div className="w-full max-w-lg">
        <Funnel
          stages={stages}
          orientation={orientation}
          showConversion={p.showConversion as boolean}
          ariaLabel="漏斗图"
          conversionLabel="转化"
        />
      </div>
    );
  },
  toCode: (p) => `<Funnel
  stages={[
    { id: "in", label: "涌入", value: 1240, tone: "brand" },
    { id: "route", label: "路由", value: 1080, tone: "brand" },
    { id: "exec", label: "执行", value: 860, tone: "warning" },
    { id: "done", label: "完成", value: 720, tone: "success" },
  ]}
  orientation="${(p.orientation as string) ?? "vertical"}"
  showConversion={${p.showConversion ?? true}}
  ariaLabel="漏斗图"
  conversionLabel="转化"
  onStageClick={(s) => console.log(s.id)}
/>`,
};
