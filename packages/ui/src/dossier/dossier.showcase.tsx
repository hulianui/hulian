"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Dossier } from "./dossier";

const sections = [
  { key: "basic", label: "基本信息", status: "done" as const, summary: "林晚晴 · 138-0000-0000" },
  { key: "intent", label: "求职意向", status: "done" as const, summary: "云栖科技 · 总裁私人秘书" },
  { key: "education", label: "教育背景", status: "partial" as const, active: true, summary: "已记录学校，待补专业理由" },
  { key: "experience", label: "工作经历", status: "empty" as const },
  { key: "knowledge", label: "雇主认知", status: "empty" as const },
  { key: "extras", label: "可选补充", status: "empty" as const, optional: true },
];

const Demo = () => (
  <div className="w-full max-w-sm">
    <Dossier sections={sections} />
  </div>
);

export const dossierShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "访谈进行中（混合三态 + 当前域高亮）", render: () => <Demo /> },
    {
      name: "全部归档",
      render: () => (
        <div className="w-full max-w-sm">
          <Dossier
            title="案卷 · 论据齐备"
            sections={sections.map((s) => ({
              ...s,
              status: "done" as const,
              active: false,
              summary: s.summary ?? "已归档",
            }))}
          />
        </div>
      ),
    },
    {
      name: "bare 内嵌态",
      render: () => (
        <div className="w-full max-w-sm rounded-[var(--radius)] bg-surface-hover p-4">
          <Dossier sections={sections.slice(0, 4)} bare />
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<Dossier sections={[{ key, label, status: "done", summary }, …]} />`,
};
