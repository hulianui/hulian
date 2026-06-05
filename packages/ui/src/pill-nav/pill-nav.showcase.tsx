import type { ShowcaseSpec } from "../showcase/types";
import { PillNav } from "./pill-nav";

const items = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
];

/** 展示用中性容器，给胶囊导航足够留白与对比 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-32 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-muted/30 p-8">
      {children}
    </div>
  );
}

/** 一个简单的胶囊形 logo 占位，悬停跟随旋转 */
function Mark() {
  return (
    <span className="grid size-full place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      瑚
    </span>
  );
}

export const pillNavShowcase: ShowcaseSpec = {
  controls: [
    { prop: "activeHref", type: "select", options: ["#home", "#features", "#pricing", "#docs"], defaultValue: "#home", label: "激活项" },
    { prop: "withLogo", type: "boolean", defaultValue: true, label: "显示 logo" },
    { prop: "initialLoadAnimation", type: "boolean", defaultValue: true, label: "入场动画" },
  ],

  states: [
    {
      name: "default（带 logo · 首项激活）",
      render: () => (
        <Stage>
          <PillNav items={items} activeHref="#home" logo={<Mark />} />
        </Stage>
      ),
    },
    {
      name: "无 logo（纯导航）",
      render: () => (
        <Stage>
          <PillNav items={items} activeHref="#features" />
        </Stage>
      ),
    },
    {
      name: "关闭入场动画",
      render: () => (
        <Stage>
          <PillNav items={items} activeHref="#pricing" logo={<Mark />} initialLoadAnimation={false} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PillNav
        items={items}
        activeHref={p.activeHref as string}
        logo={p.withLogo ? <Mark /> : undefined}
        initialLoadAnimation={p.initialLoadAnimation as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<PillNav`,
      `  items={[`,
      `    { href: "#home", label: "Home" },`,
      `    { href: "#features", label: "Features" },`,
      `    { href: "#pricing", label: "Pricing" },`,
      `    { href: "#docs", label: "Docs" },`,
      `  ]}`,
      `  activeHref="${p.activeHref}"`,
      p.withLogo ? `  logo={<Mark />}` : null,
      `  initialLoadAnimation={${p.initialLoadAnimation}}`,
      `/>`,
    ]
      .filter(Boolean)
      .join("\n"),
};
