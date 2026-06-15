"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Book3D } from "./book-3d";

export const book3dShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传 title / subtitle 即用品牌渐变封面；静止露厚度，悬停翻正。",
      code: `<Book3D title="瑚琏" subtitle="hulianui" />`,
      render: () => <Book3D title="瑚琏" subtitle="hulianui" />,
    },
    {
      title: "自定义封面渐变",
      description: "coverColor 给封面渐变起止色。",
      code: `<Book3D
  title="CSS"
  subtitle="转换"
  coverColor={{ from: "#f7b733", to: "#e0992b" }}
/>`,
      render: () => (
        <Book3D title="CSS" subtitle="转换" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
      ),
    },
    {
      title: "角标缎带",
      description: "ribbon + ribbonTone 在封面右上角贴缎带（danger / brand / success）。",
      code: `<Book3D
  title="HTML"
  subtitle="5"
  ribbon="N°1"
  ribbonTone="danger"
  coverColor={{ from: "#e0654a", to: "#c14a32" }}
/>`,
      render: () => (
        <Book3D
          title="HTML"
          subtitle="5"
          ribbon="N°1"
          ribbonTone="danger"
          coverColor={{ from: "#e0654a", to: "#c14a32" }}
        />
      ),
    },
    {
      title: "书架排布",
      description: "并列多本，悬停各自翻正。",
      code: `<div className="flex flex-wrap gap-8">
  <Book3D title="CSS" subtitle="转换" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
  <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
  <Book3D title="TS" subtitle="TYPES" ribbonTone="brand" />
</div>`,
      render: () => (
        <div className="flex flex-wrap gap-8 py-2">
          <Book3D title="CSS" subtitle="转换" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
          <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
          <Book3D title="TS" subtitle="TYPES" ribbonTone="brand" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "title", type: "text", defaultValue: "CSS" },
    { prop: "subtitle", type: "text", defaultValue: "转换" },
    { prop: "ribbon", type: "text", defaultValue: "NEW" },
    { prop: "ribbonTone", type: "select", options: ["danger", "brand", "success"], defaultValue: "danger" },
  ],
  states: [
    {
      name: "书架（悬停翻正）",
      render: () => (
        <div className="flex flex-wrap gap-8 py-2">
          <Book3D title="CSS" subtitle="转换" ribbon="NEW" coverColor={{ from: "#f7b733", to: "#e0992b" }} />
          <Book3D title="JS" subtitle="FUNCTION" coverColor={{ from: "#5aa6e0", to: "#3f7fc0" }} />
          <Book3D title="HTML" subtitle="5" ribbon="N°1" ribbonTone="danger" coverColor={{ from: "#e0654a", to: "#c14a32" }} />
          <Book3D title="TS" subtitle="TYPES" ribbonTone="brand" />
        </div>
      ),
    },
    {
      name: "品牌渐变（默认）",
      render: () => <Book3D title="瑚琏" subtitle="hulianui" />,
    },
  ],
  renderWithProps: (p) => (
    <Book3D
      title={(p.title as string) || "CSS"}
      subtitle={p.subtitle as string}
      ribbon={p.ribbon as string}
      ribbonTone={p.ribbonTone as "danger" | "brand" | "success"}
      coverColor={{ from: "#f7b733", to: "#e0992b" }}
    />
  ),
  toCode: (p) =>
    `<Book3D title="${p.title}" subtitle="${p.subtitle}"${p.ribbon ? ` ribbon="${p.ribbon}" ribbonTone="${p.ribbonTone}"` : ""} coverColor={{ from: "#f7b733", to: "#e0992b" }} />`,
};
