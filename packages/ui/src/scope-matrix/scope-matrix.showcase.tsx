"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ScopeMatrix } from "./scope-matrix";

const SUGGESTIONS = [
  "src/**",
  "docs/**",
  "**/node_modules/**",
  "**/*.test.ts",
  "packages/ui/**",
  "**/dist/**",
];

function EditableDemo({
  initialAllow = ["src/**"],
  initialDeny = ["**/node_modules/**"],
  validate,
}: {
  initialAllow?: string[];
  initialDeny?: string[];
  validate?: (p: string) => string | null;
}) {
  const [value, setValue] = useState({ allow: initialAllow, deny: initialDeny });
  return (
    <ScopeMatrix
      allow={value.allow}
      deny={value.deny}
      onChange={setValue}
      suggestions={SUGGESTIONS}
      {...(validate ? { validate } : {})}
    />
  );
}

export const scopeMatrixShowcase: ShowcaseSpec = {
  controls: [
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
    { prop: "withSuggestions", type: "boolean", defaultValue: true, label: "显示候选" },
  ],
  states: [
    { name: "可编辑", render: () => <EditableDemo /> },
    { name: "只读", render: () => <ScopeMatrix allow={["src/**"]} deny={["**/dist/**"]} /> },
    { name: "空态", render: () => <EditableDemo initialAllow={[]} initialDeny={[]} /> },
    {
      name: "仅禁止（未启用白名单）",
      render: () => <ScopeMatrix allow={[]} deny={["**/secrets/**", "**/*.pem"]} />,
    },
  ],
  examples: [
    {
      title: "任务范围配置",
      description:
        "两个语义对立的桶。底部小结会把「最终有效范围」写成人话——这类配置最容易想错的就是空白名单与优先级。",
      code: `<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}
  suggestions={derivedFromProject}
/>`,
      render: () => <EditableDemo />,
    },
    {
      title: "带语法校验",
      description:
        "组件不内置模式语法校验——glob / 正则 / ant 风格差异很大，猜错比不猜更糟。需要就传 validate。",
      code: `<ScopeMatrix
  allow={allow}
  deny={deny}
  onChange={onChange}
  validate={(p) => (p.startsWith("/") ? "请用相对模式，不要绝对路径" : null)}
/>`,
      render: () => (
        <EditableDemo
          initialAllow={[]}
          initialDeny={[]}
          validate={(p) => (p.startsWith("/") ? "请用相对模式，不要绝对路径" : null)}
        />
      ),
    },
    {
      title: "只读回顾",
      description: "不给 onChange 即为只读，用于审计视图或历史配置回看。",
      code: `<ScopeMatrix allow={record.allow} deny={record.deny} />`,
      render: () => (
        <ScopeMatrix allow={["packages/ui/**", "docs/**"]} deny={["**/dist/**", "**/node_modules/**"]} />
      ),
    },
  ],
  renderWithProps: (p) => (
    <ScopeMatrix
      allow={["src/**"]}
      deny={["**/node_modules/**"]}
      onChange={() => {}}
      readOnly={p.readOnly as boolean}
      suggestions={p.withSuggestions ? SUGGESTIONS : []}
    />
  ),
  toCode: (p) => `<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}${p.withSuggestions ? "\n  suggestions={derivedFromProject}" : ""}${
    p.readOnly ? "\n  readOnly" : ""
  }
/>`,
};
