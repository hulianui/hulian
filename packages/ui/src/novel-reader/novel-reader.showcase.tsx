"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { NovelReader } from "./novel-reader";

const chapters = [
  { id: "c1", title: "夜航", content: "河面暗下来。沈晚把灯挂上桅杆。" },
  { id: "c2", title: "返程", content: "回程更轻。她把火重新点上。" },
];

function Demo() {
  return (
    <NovelReader
      className="h-[28rem] w-full max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border"
      title="渡口的灯"
      author="沈晚"
      chapters={chapters}
    />
  );
}

const code = `<NovelReader
  className="h-[28rem]"
  title="渡口的灯"
  author="沈晚"
  chapters={chapters}
/>`;

export const novelReaderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "菜单默认收起，打开就是正文。章末的下一章留在正文里。点中间才唤出目录和阅读设置。",
      code,
      render: () => <Demo />,
    },
  ],
  controls: [],
  states: [{ name: "连读", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () => code,
};
