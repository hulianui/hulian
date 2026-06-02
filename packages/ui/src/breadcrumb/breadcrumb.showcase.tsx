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
  { label: "首页", href: "/" },
  { label: "组件", href: "/components" },
  { label: "面包屑" },
];

const longPath: BreadcrumbItem[] = [
  { label: "首页", href: "/" },
  { label: "文档", href: "/docs" },
  { label: "设计系统", href: "/docs/design-system" },
  { label: "导航族", href: "/docs/design-system/navigation" },
  { label: "面包屑组件", href: "/docs/design-system/navigation/breadcrumb" },
  { label: "无障碍语义" },
];

const separatorByKey: Record<string, ReactNode> = {
  slash: "/",
  chevron: Chevron,
  dot: "·",
};

export const breadcrumbShowcase: ShowcaseSpec = {
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
          items={[{ label: "首页", href: "/" }, { label: "归档" }, { label: "2026 年报" }]}
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
