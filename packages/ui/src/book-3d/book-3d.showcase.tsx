"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Book3D } from "./book-3d";

export const book3dShowcase: ShowcaseSpec = {
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
