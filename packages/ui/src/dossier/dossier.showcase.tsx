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
    <Dossier
      sections={sections}
      title="案卷"
      archivedLabel="已归档"
      optionalLabel="可选"
    />
  </div>
);

export const dossierShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "三态域（已归档/部分/空）+ 当前采集域高亮，头部自动算进度。",
      code: `<Dossier
  sections={[
    { key: "basic", label: "基本信息", status: "done", summary: "林晚晴 · 138-0000-0000" },
    { key: "intent", label: "求职意向", status: "done", summary: "云栖科技 · 总裁私人秘书" },
    { key: "education", label: "教育背景", status: "partial", active: true, summary: "已记录学校，待补专业理由" },
    { key: "experience", label: "工作经历", status: "empty" },
    { key: "extras", label: "可选补充", status: "empty", optional: true },
  ]}
  title="案卷"
  archivedLabel="已归档"
  optionalLabel="可选"
/>`,
      render: () => (
        <div className="w-full max-w-sm">
          <Dossier
            sections={sections}
            title="案卷"
            archivedLabel="已归档"
            optionalLabel="可选"
          />
        </div>
      ),
    },
    {
      title: "全部归档",
      description: "所有域 done 时进度满格，自定义 title。",
      code: `<Dossier
  title="案卷 · 论据齐备"
  archivedLabel="已归档"
  optionalLabel="可选"
  sections={sections.map((s) => ({ ...s, status: "done", active: false }))}
/>`,
      render: () => (
        <div className="w-full max-w-sm">
          <Dossier
            title="案卷 · 论据齐备"
            archivedLabel="已归档"
            optionalLabel="可选"
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
      title: "内嵌（bare）",
      description: "bare 去掉容器边框背景，嵌入其它面板。",
      code: `<Dossier
  sections={sections.slice(0, 4)}
  title="案卷"
  archivedLabel="已归档"
  optionalLabel="可选"
  bare
/>`,
      render: () => (
        <div className="w-full max-w-sm rounded-[var(--radius)] bg-surface-hover p-4">
          <Dossier
            sections={sections.slice(0, 4)}
            title="案卷"
            archivedLabel="已归档"
            optionalLabel="可选"
            bare
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "访谈进行中（混合三态 + 当前域高亮）", render: () => <Demo /> },
    {
      name: "全部归档",
      render: () => (
        <div className="w-full max-w-sm">
          <Dossier
            title="案卷 · 论据齐备"
            archivedLabel="已归档"
            optionalLabel="可选"
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
          <Dossier
            sections={sections.slice(0, 4)}
            title="案卷"
            archivedLabel="已归档"
            optionalLabel="可选"
            bare
          />
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<Dossier
  sections={[{ key, label, status: "done", summary }, …]}
  title="案卷"
  archivedLabel="已归档"
  optionalLabel="可选"
/>`,
};
