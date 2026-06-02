"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Textarea } from "./textarea";

export const textareaShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "写点什么…", label: "占位符" },
    { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
    { prop: "autoResize", type: "boolean", defaultValue: false, label: "自适应高度" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Textarea placeholder="写点什么…" className="w-64" /> },
    {
      name: "autoResize",
      render: () => (
        <Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行\n第四行"} className="w-64" />
      ),
    },
    { name: "invalid", render: () => <Textarea invalid defaultValue="错的内容" className="w-64" /> },
    { name: "disabled", render: () => <Textarea disabled defaultValue="禁用态" className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Textarea
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      rows={p.rows as number}
      autoResize={p.autoResize as boolean}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Textarea size="${p.size}" placeholder="${p.placeholder}" rows={${p.rows}}${
      p.autoResize ? " autoResize" : ""
    }${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} />`,
};
