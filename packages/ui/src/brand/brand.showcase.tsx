import type { ShowcaseSpec } from "../showcase/types";
import { Brand } from "./brand";

function Mark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
    </svg>
  );
}

export const brandShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "方角徽章 + 站点名。不传 mark 时自动取品牌名首字（中文一个字 / 英文首字母）。",
      code: `<Brand name="瑚琏后台" />
<Brand name="hulian admin" />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏后台" />
          <Brand name="hulian admin" />
        </div>
      ),
    },
    {
      title: "自定义徽章 · 副标题 · 配色",
      description: "mark 接图标/图片；description 挂一行版本或定位；color 换徽章底色。",
      code: `<Brand mark={<Logo />} name="瑚琏" description="v0.18.0" />
<Brand name="数据平台" color="chart-3" description="内部系统" />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="瑚琏" description="v0.18.0" />
          <Brand name="数据平台" color="chart-3" description="内部系统" />
        </div>
      ),
    },
    {
      title: "三档尺寸 · 收起态",
      description: "sm 导航栏 / md 侧栏 / lg 登录页品牌区；省略 name 只出徽章（侧栏收起时用）。",
      code: `<Brand size="sm" name="瑚琏" />
<Brand size="md" name="瑚琏" />
<Brand size="lg" name="瑚琏" />
<Brand mark={<Logo />} />   {/* 收起态 */}`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="瑚琏" />
          <Brand size="md" name="瑚琏" />
          <Brand size="lg" name="瑚琏" />
          <Brand mark={<Mark />} />
        </div>
      ),
    },
    {
      title: "链回首页",
      description: "href 走普通链接；render 接框架路由件（react-router / next/link），避免 SPA 整页刷新。",
      code: `<Brand name="瑚琏" href="/" />
<Brand name="瑚琏" render={<Link to="/" />} />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏" href="/" />
          <Brand mark={<Mark />} name="瑚琏" description="点我回首页" href="/" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["md", "sm", "lg"], defaultValue: "md" },
    { prop: "name", type: "text", defaultValue: "瑚琏后台" },
    { prop: "description", type: "text", defaultValue: "" },
    { prop: "color", type: "select", options: ["primary", "chart-2", "chart-3", "chart-5"], defaultValue: "primary" },
  ],
  states: [
    {
      name: "默认（首字徽章）",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏后台" />
          <Brand name="hulian admin" />
        </div>
      ),
    },
    {
      name: "自定义徽章 + 副标题",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="瑚琏" description="v0.18.0" />
          <Brand name="数据平台" color="chart-3" description="内部系统" />
        </div>
      ),
    },
    {
      name: "三档尺寸 + 收起态",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="瑚琏" />
          <Brand size="md" name="瑚琏" />
          <Brand size="lg" name="瑚琏" />
          <Brand mark={<Mark />} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Brand
      name={(p.name as string) || undefined}
      description={(p.description as string) || undefined}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      color={(p.color as string) ?? "primary"}
    />
  ),
  toCode: (p) =>
    `<Brand\n  name="${p.name ?? "瑚琏后台"}"${p.description ? `\n  description="${p.description}"` : ""}${
      p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""
    }${p.color && p.color !== "primary" ? `\n  color="${p.color}"` : ""}\n/>`,
};
