"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { NovelEditor } from "./novel-editor";

const chapters = [{ id: "c1", title: "夜航", content: "河面暗下来。" }];

function Demo() {
  return <NovelEditor className="h-[28rem] w-full" defaultChapters={chapters} />;
}

const code = `<NovelEditor className="h-[28rem]" defaultChapters={chapters} />`;

export const novelEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "左侧管理章节，右侧写 Markdown，并可以同时看预览。",
      code,
      render: () => <Demo />,
    },
  ],
  controls: [],
  states: [{ name: "写作", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () => code,
};
