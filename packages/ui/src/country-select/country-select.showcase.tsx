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
