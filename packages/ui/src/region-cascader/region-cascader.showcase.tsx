"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RegionCascader } from "./region-cascader";

function Demo({
  level = 3,
  showSearch = true,
  defaultValue = [],
  disabled,
  invalid,
}: {
  level?: 2 | 3;
  showSearch?: boolean;
  defaultValue?: string[];
  disabled?: boolean;
  invalid?: boolean;
}) {
  const [codes, setCodes] = useState<string[]>(defaultValue);
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="w-80 space-y-2">
      <RegionCascader
        level={level}
        showSearch={showSearch}
        value={codes}
        onChange={(c, n) => {
          setCodes(c);
          setNames(n);
        }}
        disabled={disabled}
        invalid={invalid}
      />
      <div className="text-xs text-muted">
        {names.length ? `已选：${names.join(" / ")}（${codes.join(",")}）` : "未选择"}
      </div>
    </div>
  );
}

export const regionCascaderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "三级（省/市/区县）",
      description: "内置全量行政区划，默认三级联动。onChange 同时给 code 路径与名称路径（表单常存名称）。",
      code: `<RegionCascader
  value={codes}
  onChange={(codes, names) => save(codes, names)}
  showSearch
/>`,
      render: () => (
        <div className="w-80">
          <RegionCascader showSearch onChange={() => {}} />
        </div>
      ),
    },
    {
      title: "默认值回显",
      description: "defaultValue 传 code 路径即可回显（非受控）。",
      code: `<RegionCascader defaultValue={["11", "1101", "110105"]} />`,
      render: () => (
        <div className="w-80">
          <RegionCascader defaultValue={["11", "1101", "110105"]} onChange={() => {}} />
        </div>
      ),
    },
    {
      title: "两级（省/市）",
      description: "level=2 只联动到市一级。",
      code: `<RegionCascader level={2} defaultValue={["44", "4401"]} />`,
      render: () => (
        <div className="w-80">
          <RegionCascader level={2} defaultValue={["44", "4401"]} onChange={() => {}} />
        </div>
      ),
    },
    {
      title: "禁用态",
      code: `<RegionCascader disabled defaultValue={["31", "3101", "310115"]} />`,
      render: () => (
        <div className="w-80">
          <RegionCascader disabled defaultValue={["31", "3101", "310115"]} onChange={() => {}} />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "showSearch", type: "boolean", defaultValue: true, label: "浮层搜索" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "三级（省/市/区县 · 带搜索）", render: () => <Demo /> },
    { name: "默认值回显", render: () => <Demo defaultValue={["11", "1101", "110105"]} /> },
    { name: "两级（省/市）", render: () => <Demo level={2} defaultValue={["44", "4401"]} /> },
    { name: "不带搜索（纯逐级浏览）", render: () => <Demo showSearch={false} /> },
    { name: "禁用", render: () => <Demo disabled defaultValue={["31", "3101", "310115"]} /> },
    { name: "无效态", render: () => <Demo invalid /> },
  ],
  renderWithProps: (p) => (
    <Demo
      showSearch={p.showSearch !== false}
      disabled={Boolean(p.disabled)}
      invalid={Boolean(p.invalid)}
    />
  ),
  toCode: () =>
    `<RegionCascader
  value={codes}
  onChange={(codes, names) => save(codes, names)}
  showSearch
/>`,
};
