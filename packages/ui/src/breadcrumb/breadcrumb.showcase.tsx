"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Breadcrumb } from "./breadcrumb";
import type { BreadcrumbItem } from "./breadcrumb.types";

// 内联 chevron（零依赖），作 separator 备选。
const Chevron = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
    <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const sample: BreadcrumbItem[] = [
  { label: "首页", href: "#" },
  { label: "组件", href: "#" },
  { label: "面包屑" },
];

const longPath: BreadcrumbItem[] = [
  { label: "首页", href: "#" },
  { label: "文档", href: "#" },
  { label: "设计系统", href: "#" },
  { label: "导航族", href: "#" },
  { label: "面包屑组件", href: "#" },
  { label: "无障碍语义" },
];

const separatorByKey: Record<string, ReactNode> = {
  slash: "/",
  chevron: Chevron,
  dot: "·",
};

export const breadcrumbShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 items 数组（从根到当前页），末项默认作为当前页且不可点。",
      code: `<Breadcrumb
  items={[
    { label: "首页", href: "/" },
    { label: "组件", href: "/components" },
    { label: "面包屑" },
  ]}
/>`,
      render: () => <Breadcrumb items={sample} />,
    },
    {
      title: "自定义分隔符",
      description:
        'separator 接受任意 ReactNode（字符或图标），默认 "/"，分隔符自动加 aria-hidden。',
      code: `<Breadcrumb items={items} separator={<ChevronIcon />} />`,
      render: () => <Breadcrumb items={sample} separator={Chevron} />,
    },
    {
      title: "不可点的中间项",
      description: "省略某项的 href 即渲染为中性纯文本（不可导航的祖先），仍非当前页。",
      code: `<Breadcrumb
  items={[
    { label: "首页", href: "/" },
    { label: "归档" },
    { label: "2026 年报" },
  ]}
/>`,
      render: () => (
        <Breadcrumb
          items={[
            { label: "首页", href: "#" },
            { label: "归档" },
            { label: "2026 年报" },
          ]}
        />
      ),
    },
    {
      title: "长路径自动换行",
      description: "项数较多时在窄容器内自动换行，配合 chevron 分隔符更清晰。",
      code: `<div className="max-w-xs">
  <Breadcrumb items={longPath} separator={<ChevronIcon />} />
</div>`,
      render: () => (
        <div className="max-w-xs rounded-[var(--radius)] border border-border p-3">
          <Breadcrumb items={longPath} separator={Chevron} />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "separator",
      type: "select",
      options: ["slash", "chevron", "dot"],
      defaultValue: "slash",
      label: "分隔符",
    },
  ],
  states: [
    {
      name: "默认（/ 分隔，末项当前页）",
      render: () => <Breadcrumb items={sample} />,
    },
    {
      name: "chevron 分隔符",
      render: () => <Breadcrumb items={sample} separator={Chevron} />,
    },
    {
      name: "含不可点中间项（无 href）",
      render: () => (
        <Breadcrumb
          items={[
            { label: "首页", href: "#" },
            { label: "归档" },
            { label: "2026 年报" },
          ]}
        />
      ),
    },
    {
      name: "长路径（窄容器自动换行）",
      render: () => (
        <div className="max-w-xs rounded-[var(--radius)] border border-border p-3">
          <Breadcrumb items={longPath} separator={Chevron} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Breadcrumb items={sample} separator={separatorByKey[p.separator as string] ?? "/"} />
  ),
  toCode: (p) =>
    p.separator === "slash"
      ? `<Breadcrumb items={items} />`
      : `<Breadcrumb items={items} separator={${
          p.separator === "chevron" ? "<ChevronIcon />" : '"·"'
        }} />`,
};
