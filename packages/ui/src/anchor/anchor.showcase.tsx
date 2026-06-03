"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Anchor } from "./anchor";
import type { AnchorItem } from "./anchor.types";

const docItems: AnchorItem[] = [
  { href: "#sec-overview", title: "概述" },
  {
    href: "#sec-guide",
    title: "指南",
    children: [
      { href: "#sec-install", title: "安装" },
      { href: "#sec-usage", title: "基础用法" },
    ],
  },
  { href: "#sec-api", title: "API" },
  { href: "#sec-faq", title: "常见问题" },
];

const sections = [
  { id: "sec-overview", title: "概述", body: "锚点导航跟随阅读进度高亮当前章节，并平滑滚动到目标。" },
  { id: "sec-guide", title: "指南", body: "包含安装与基础用法两个子节，二级项缩进展示。" },
  { id: "sec-install", title: "安装", body: "通过包管理器安装组件库后即可引入 Anchor。" },
  { id: "sec-usage", title: "基础用法", body: "传入 items 数组，每项给 href 与 title；children 形成二级。" },
  { id: "sec-api", title: "API", body: "items / offsetTop / onChange 三个核心属性。" },
  { id: "sec-faq", title: "常见问题", body: "页面有固定头部时设置 offsetTop 避开遮挡。" },
];

// 自包含联动 demo：左侧锚点 + 右侧可滚动章节区。
// 锚点用默认视口作 scrollspy 根，这里给章节区一段高度展示结构与点击；真实长页随页面滚动高亮。
function AnchorDemo({ offsetTop }: { offsetTop?: number }) {
  return (
    <div className="flex w-full max-w-2xl gap-6 rounded-[var(--radius)] border border-border p-4">
      <Anchor items={docItems} offsetTop={offsetTop} className="w-36 shrink-0 self-start" />
      <div className="min-w-0 flex-1 space-y-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-4">
            <h3 className="mb-1 font-medium text-foreground">{s.title}</h3>
            <p className="text-sm text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export const anchorShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "offsetTop",
      type: "number",
      defaultValue: 0,
      label: "offsetTop（固定头偏移 px）",
    },
  ],
  states: [
    {
      name: "默认（锚点 + 章节联动，滚动页面高亮当前节）",
      render: () => <AnchorDemo />,
    },
    {
      name: "含二级项（缩进 + 滑动指示条）",
      render: () => (
        <div className="rounded-[var(--radius)] border border-border p-4">
          <Anchor items={docItems} className="w-44" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <AnchorDemo offsetTop={Number(p.offsetTop) || 0} />,
  toCode: (p) => {
    const off = Number(p.offsetTop) || 0;
    return off
      ? `<Anchor items={items} offsetTop={${off}} onChange={setHash} />`
      : `<Anchor items={items} onChange={setHash} />`;
  },
};
