"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { StaggeredMenu } from "./staggered-menu";

const items = [
  { label: "首页", link: "#home", ariaLabel: "前往首页" },
  { label: "产品", link: "#product", ariaLabel: "查看产品" },
  { label: "方案", link: "#solution", ariaLabel: "查看方案" },
  { label: "关于", link: "#about", ariaLabel: "关于我们" },
];

const socialItems = [
  { label: "微博", link: "https://weibo.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "知乎", link: "https://zhihu.com" },
];

/** 展示用容器：StaggeredMenu 内部 absolute 定位，需要 relative + 固定高度 + overflow-hidden 承托 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-96 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background">
      {children}
    </div>
  );
}

export const staggeredMenuShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "position",
      type: "select",
      options: ["right", "left"],
      defaultValue: "right",
      label: "面板方向",
    },
    { prop: "displayItemNumbering", type: "boolean", defaultValue: true, label: "条目序号" },
    { prop: "displaySocials", type: "boolean", defaultValue: true, label: "社交区" },
  ],

  states: [
    {
      name: "default（右侧 · 点击触发按钮打开）",
      render: () => (
        <Stage>
          <StaggeredMenu items={items} socialItems={socialItems} />
        </Stage>
      ),
    },
    {
      name: "左侧滑入",
      render: () => (
        <Stage>
          <StaggeredMenu position="left" items={items} socialItems={socialItems} brand="HULIAN" />
        </Stage>
      ),
    },
    {
      name: "自定义色层 + 强调色（暖橙）",
      render: () => (
        <Stage>
          <StaggeredMenu
            items={items}
            socialItems={socialItems}
            colors={["var(--color-chart-3)", "var(--color-chart-1)"]}
            accentColor="oklch(0.72 0.22 30)"
          />
        </Stage>
      ),
    },
    {
      name: "无序号 + 无社交区",
      render: () => (
        <Stage>
          <StaggeredMenu items={items} displayItemNumbering={false} displaySocials={false} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <StaggeredMenu
        position={p.position as "left" | "right"}
        displayItemNumbering={p.displayItemNumbering as boolean}
        displaySocials={p.displaySocials as boolean}
        items={items}
        socialItems={socialItems}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-96 overflow-hidden rounded-xl border border-border">`,
      `  <StaggeredMenu`,
      `    position="${p.position}"`,
      `    displayItemNumbering={${p.displayItemNumbering}}`,
      `    displaySocials={${p.displaySocials}}`,
      `    items={[{ label: "首页", link: "#home" }, { label: "产品", link: "#product" }]}`,
      `    socialItems={[{ label: "GitHub", link: "https://github.com" }]}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
