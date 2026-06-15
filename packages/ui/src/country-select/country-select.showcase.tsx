"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CountrySelect } from "./country-select";

function SingleDemo({
  defaultValue = "",
  showDialCode,
  showEnglish = true,
  size,
  disabled,
  invalid,
}: {
  defaultValue?: string;
  showDialCode?: boolean;
  showEnglish?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [code, setCode] = useState<string>(defaultValue);
  return (
    <div className="w-72 space-y-2">
      <CountrySelect
        value={code}
        onChange={(v) => setCode(v as string)}
        showDialCode={showDialCode}
        showEnglish={showEnglish}
        size={size}
        disabled={disabled}
        invalid={invalid}
      />
      <div className="text-xs text-muted">value：{code || "（空）"}</div>
    </div>
  );
}

function MultiDemo({ defaultValue = [] as string[] }: { defaultValue?: string[] }) {
  const [codes, setCodes] = useState<string[]>(defaultValue);
  return (
    <div className="w-80 space-y-2">
      <CountrySelect multiple value={codes} onChange={(v) => setCodes(v as string[])} showDialCode />
      <div className="text-xs text-muted">value：[{codes.join(", ") || "（空）"}]</div>
    </div>
  );
}

export const countrySelectShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单选国家/地区，搜索按中文/英文/码/区号全字段匹配。",
      code: `<CountrySelect defaultValue="CN" className="w-72" />`,
      render: () => <CountrySelect defaultValue="CN" className="w-72" />,
    },
    {
      title: "显示区号",
      description: "showDialCode 在下拉行右侧补国际区号。",
      code: `<CountrySelect defaultValue="US" showDialCode className="w-72" />`,
      render: () => <CountrySelect defaultValue="US" showDialCode className="w-72" />,
    },
    {
      title: "多选（chips）",
      description: "multiple 后已选项以 chips 回显，可继续搜索追加。",
      code: `<CountrySelect multiple defaultValue={["CN", "US", "JP"]} className="w-80" />`,
      render: () => <CountrySelect multiple defaultValue={["CN", "US", "JP"]} className="w-80" />,
    },
    {
      title: "尺寸",
      description: "size 支持 sm / md / lg。",
      code: `<>
  <CountrySelect size="sm" defaultValue="GB" className="w-72" />
  <CountrySelect size="lg" defaultValue="FR" className="w-72" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <CountrySelect size="sm" defaultValue="GB" className="w-72" />
          <CountrySelect size="lg" defaultValue="FR" className="w-72" />
        </div>
      ),
    },
    {
      title: "禁用 / 无效态",
      description: "disabled 屏蔽交互；invalid 触发器变 danger 描边。",
      code: `<>
  <CountrySelect disabled defaultValue="FR" className="w-72" />
  <CountrySelect invalid className="w-72" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <CountrySelect disabled defaultValue="FR" className="w-72" />
          <CountrySelect invalid className="w-72" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "showDialCode", type: "boolean", defaultValue: false, label: "显示区号" },
    { prop: "showEnglish", type: "boolean", defaultValue: true, label: "显示英文名" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "单选", render: () => <SingleDemo /> },
    { name: "单选 · 已选 + 区号", render: () => <SingleDemo defaultValue="CN" showDialCode /> },
    { name: "多选（chips）", render: () => <MultiDemo defaultValue={["CN", "US", "JP"]} /> },
    { name: "small", render: () => <SingleDemo size="sm" defaultValue="GB" /> },
    { name: "禁用", render: () => <SingleDemo disabled defaultValue="FR" /> },
    { name: "无效态", render: () => <SingleDemo invalid /> },
  ],
  renderWithProps: (p) => (
    <SingleDemo
      showDialCode={Boolean(p.showDialCode)}
      showEnglish={p.showEnglish !== false}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      disabled={Boolean(p.disabled)}
      invalid={Boolean(p.invalid)}
    />
  ),
  toCode: () =>
    `<CountrySelect value={code} onChange={setCode} showDialCode />
{/* 多选 */}
<CountrySelect multiple value={codes} onChange={setCodes} />`,
};
