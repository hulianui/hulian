"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { StaggeredMenu } from "./staggered-menu";

const items = [
  { label: "首页", link: "#home", ariaLabel: "前往首页" },
  { label: "产品", link: "#product", ariaLabel: "查看产品" },
  { label: "方案", link: "#solution", ariaLabel: "查看方案" },
  { label: "关于", link: "#about", ariaLabel: "关于我们" },
];

// offsite-ok: socialItems 是真实的站外社交账号，组件对这一族恒用 target="_blank"
// （staggered-menu.tsx:308），点击不会顶掉当前页。菜单主项仍必须是相对锚点。
const socialItems = [
  { label: "微博", link: "https://weibo.com" },
  { label: "GitHub", link: "https://github.com" },
  { label: "知乎", link: "https://zhihu.com" },
];

/** 展示用容器：StaggeredMenu 内部 absolute 定位，需要 relative + 固定高度 + overflow-hidden 承托 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-96 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-bg">
      {children}
    </div>
  );
}

export const staggeredMenuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "放进 relative + 固定高度 + overflow-hidden 的容器，点右上角按钮唤起右侧滑入面板。",
      // offsite-ok: 示例代码里的 socialItems 是站外社交账号，组件对这一族恒用 target="_blank"
      code: `<div className="relative h-96 overflow-hidden rounded-xl border border-border">
  <StaggeredMenu
    items={[
      { label: "首页", link: "#home" },
      { label: "产品", link: "#product" },
      { label: "方案", link: "#solution" },
      { label: "关于", link: "#about" },
    ]}
    socialItems={[
      { label: "GitHub", link: "https://github.com" },
      { label: "知乎", link: "https://zhihu.com" },
    ]}
  />
</div>`,
      render: () => (
        <Stage>
          <StaggeredMenu items={items} socialItems={socialItems} />
        </Stage>
      ),
    },
    {
      title: "左侧滑入 + 自定义品牌",
      description: "position=\"left\" 让面板与色层从左侧滑入，brand 槽自定义左上角品牌文字。",
      code: `<StaggeredMenu
  position="left"
  brand="HULIAN"
  items={items}
  socialItems={socialItems}
/>`,
      render: () => (
        <Stage>
          <StaggeredMenu position="left" items={items} socialItems={socialItems} brand="HULIAN" />
        </Stage>
      ),
    },
    {
      title: "自定义色层与强调色",
      description: "colors 控制背后错峰色层，accentColor 影响序号 / 社交标题 / 条目 hover 色。",
      code: `<StaggeredMenu
  items={items}
  socialItems={socialItems}
  colors={["var(--color-chart-3)", "var(--color-chart-1)"]}
  accentColor="oklch(0.72 0.22 30)"
/>`,
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
      title: "精简：无序号无社交区",
      description: "displayItemNumbering 与 displaySocials 置 false，只保留主条目。",
      code: `<StaggeredMenu
  items={items}
  displayItemNumbering={false}
  displaySocials={false}
/>`,
      render: () => (
        <Stage>
          <StaggeredMenu items={items} displayItemNumbering={false} displaySocials={false} />
        </Stage>
      ),
    },
  ],

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
      // offsite-ok: 社交外链由组件恒以新标签打开
      `    socialItems={[{ label: "GitHub", link: "https://github.com" }]}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
