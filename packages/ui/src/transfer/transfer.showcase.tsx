"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Transfer } from "./transfer";
import type { TransferItem } from "./transfer.types";

const data: TransferItem[] = [
  { key: "react", label: "React", description: "声明式 UI 库" },
  { key: "vue", label: "Vue", description: "渐进式框架" },
  { key: "svelte", label: "Svelte", description: "编译时框架" },
  { key: "solid", label: "Solid", description: "细粒度响应式" },
  { key: "angular", label: "Angular", description: "企业级框架", disabled: true },
  { key: "qwik", label: "Qwik", description: "可恢复性" },
  { key: "astro", label: "Astro", description: "内容优先" },
];

function Demo({ searchable = false, disabled = false }: { searchable?: boolean; disabled?: boolean }) {
  const [target, setTarget] = useState<string[]>(["vue", "solid"]);
  return (
    <Transfer
      dataSource={data}
      targetKeys={target}
      onChange={setTarget}
      searchable={searchable}
      disabled={disabled}
      titles={["可选框架", "已选框架"]}
    />
  );
}

export const transferShowcase: ShowcaseSpec = {
  controls: [
    { prop: "searchable", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "basic", render: () => <Demo /> },
    { name: "searchable", render: () => <Demo searchable /> },
    { name: "disabled", render: () => <Demo disabled /> },
  ],
  renderWithProps: (p) => <Demo searchable={Boolean(p.searchable)} disabled={Boolean(p.disabled)} />,
  toCode: (p) =>
    `<Transfer\n  dataSource={data}\n  targetKeys={target}\n  onChange={setTarget}${
      p.searchable ? "\n  searchable" : ""
    }${p.disabled ? "\n  disabled" : ""}\n/>`,
};
