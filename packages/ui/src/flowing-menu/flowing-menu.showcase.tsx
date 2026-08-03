"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FlowingMenu } from "./flowing-menu";

/** 展示用定高容器：流动菜单需要足够纵向空间才能体现逐项揭幕 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border">
      {children}
    </div>
  );
}

const demoItems = [
  {
    link: "https://example.com/#discover",
    text: "Discover",
    image: "https://picsum.photos/seed/fm-a/240/120",
  },
  {
    link: "https://example.com/#build",
    text: "Build",
    image: "https://picsum.photos/seed/fm-b/240/120",
  },
  {
    link: "https://example.com/#ship",
    text: "Ship",
    image: "https://picsum.photos/seed/fm-c/240/120",
  },
  {
    link: "https://example.com/#scale",
    text: "Scale",
    image: "https://picsum.photos/seed/fm-d/240/120",
  },
];

const textOnly = [
  { link: "https://example.com/#home", text: "首页" },
  { link: "https://example.com/#products", text: "产品" },
  { link: "https://example.com/#about", text: "关于" },
];

export const flowingMenuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "竖排菜单项，指针从最近的上/下边缘滑入时一块跑马灯（文字 + 图片）从同侧揭幕铺满整行，离开时退回。需放在定高容器内。",
      code: `<div className="h-80 overflow-hidden rounded-xl border">
  <FlowingMenu
    items={[
      { link: "#discover", text: "Discover", image: "/a.jpg" },
      { link: "#build", text: "Build", image: "/b.jpg" },
      { link: "#ship", text: "Ship", image: "/c.jpg" },
    ]}
  />
</div>`,
      render: () => (
        <Stage>
          <FlowingMenu items={demoItems} />
        </Stage>
      ),
    },
    {
      title: "纯文字（无图片）",
      description: "item 不传 image 时跑马灯只跑文字，用一截小横杠分隔，不渲染图片块。",
      code: `<FlowingMenu
  items={[
    { link: "#home", text: "首页" },
    { link: "#products", text: "产品" },
    { link: "#about", text: "关于" },
  ]}
/>`,
      render: () => (
        <Stage>
          <FlowingMenu items={textOnly} />
        </Stage>
      ),
    },
    {
      title: "速度与份数",
      description:
        "speed 越大跑马灯越慢；repeat 控制单项内重复份数，撑满并保证无缝循环（最小 2）。",
      code: `<FlowingMenu items={items} speed={30} repeat={6} />`,
      render: () => (
        <Stage>
          <FlowingMenu items={demoItems.slice(0, 3)} speed={30} repeat={6} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 18, label: "跑马灯秒数" },
    { prop: "repeat", type: "number", defaultValue: 4, label: "重复份数" },
  ],

  states: [
    {
      name: "default（悬停项查看揭幕）",
      render: () => (
        <Stage>
          <FlowingMenu items={demoItems} />
        </Stage>
      ),
    },
    {
      name: "纯文字（无图片）",
      render: () => (
        <Stage>
          <FlowingMenu items={textOnly} />
        </Stage>
      ),
    },
    {
      name: "慢速大字（壁纸级）",
      render: () => (
        <Stage>
          <FlowingMenu items={demoItems.slice(0, 3)} speed={30} repeat={6} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FlowingMenu items={demoItems} speed={p.speed as number} repeat={p.repeat as number} />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="h-80 overflow-hidden rounded-xl border border-border">`,
      `  <FlowingMenu`,
      `    items={[`,
      `      { link: "#discover", text: "Discover", image: "/a.jpg" },`,
      `      { link: "#build", text: "Build", image: "/b.jpg" },`,
      `    ]}`,
      `    speed={${p.speed}}`,
      `    repeat={${p.repeat}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
