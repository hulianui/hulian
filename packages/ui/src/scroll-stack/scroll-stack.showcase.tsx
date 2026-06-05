"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollStack, ScrollStackItem } from "./scroll-stack";

/** 固定高度的舞台，制造一个内部可滚动的窗口，让堆叠效果在卡片随滚动钉住时可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[28rem] w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted/10">
      {children}
    </div>
  );
}

const CARDS = [
  { title: "采集", desc: "多源数据接入与清洗，统一进入元数据层。" },
  { title: "建模", desc: "低代码可视化建模，沉淀业务语义。" },
  { title: "编排", desc: "节点画布编排任务链路，按拓扑序执行。" },
  { title: "洞察", desc: "实时大屏与指标看板，驱动决策闭环。" },
];

function Deck(props: Parameters<typeof ScrollStack>[0]) {
  return (
    <Stage>
      <ScrollStack {...props}>
        {CARDS.map((c, i) => (
          <ScrollStackItem key={c.title}>
            <div className="flex h-full flex-col justify-between">
              <span className="text-xs font-medium text-muted">0{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">{c.desc}</p>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </Stage>
  );
}

export const scrollStackShowcase: ShowcaseSpec = {
  controls: [
    { prop: "itemDistance", type: "number", defaultValue: 100, label: "卡片间距 px" },
    { prop: "itemScale", type: "number", defaultValue: 0.03, label: "缩放增量" },
    { prop: "baseScale", type: "number", defaultValue: 0.85, label: "基础缩放" },
    { prop: "rotationAmount", type: "number", defaultValue: 0, label: "旋转增量 deg" },
    { prop: "blurAmount", type: "number", defaultValue: 0, label: "景深模糊 px" },
  ],

  states: [
    {
      name: "default（向下滚动看卡片堆叠）",
      render: () => <Deck />,
    },
    {
      name: "扇形旋转（rotationAmount=3）",
      render: () => <Deck rotationAmount={3} />,
    },
    {
      name: "景深模糊（blurAmount=2）",
      render: () => <Deck blurAmount={2} />,
    },
    {
      name: "紧凑堆叠（小间距 + 高基础缩放）",
      render: () => <Deck itemDistance={60} baseScale={0.92} itemStackDistance={20} />,
    },
  ],

  renderWithProps: (p) => (
    <Deck
      itemDistance={p.itemDistance as number}
      itemScale={p.itemScale as number}
      baseScale={p.baseScale as number}
      rotationAmount={p.rotationAmount as number}
      blurAmount={p.blurAmount as number}
    />
  ),

  toCode: (p) =>
    [
      `<div className="h-[28rem] overflow-hidden rounded-xl border border-border">`,
      `  <ScrollStack`,
      `    itemDistance={${p.itemDistance}}`,
      `    itemScale={${p.itemScale}}`,
      `    baseScale={${p.baseScale}}`,
      `    rotationAmount={${p.rotationAmount}}`,
      `    blurAmount={${p.blurAmount}}`,
      `  >`,
      `    <ScrollStackItem>卡片 1</ScrollStackItem>`,
      `    <ScrollStackItem>卡片 2</ScrollStackItem>`,
      `    <ScrollStackItem>卡片 3</ScrollStackItem>`,
      `  </ScrollStack>`,
      `</div>`,
    ].join("\n"),
};
