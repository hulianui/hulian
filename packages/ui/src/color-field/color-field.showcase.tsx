"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ColorField } from "./color-field";

function Controlled() {
  const [hex, setHex] = useState("#38e8ff");
  return (
    <span className="inline-flex items-center gap-3">
      <ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="主色" />
      <span className="font-mono text-sm text-muted">{hex}</span>
    </span>
  );
}

export const colorFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "受控",
      description:
        "value + onValueChange 受控。回调参数恒为规范化后的 #rrggbb —— 输入 #abc 抛出的是 #aabbcc。",
      code: `const [hex, setHex] = useState("#38e8ff");
<ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="主色" />`,
      render: () => <Controlled />,
    },
    {
      title: "三种尺寸",
      description: "sm / md / lg，色块随之缩放，与 Input 同一套外壳变体。",
      code: `<ColorField size="sm" defaultValue="#38e8ff" className="w-32" />
<ColorField size="md" defaultValue="#7c5cff" className="w-36" />
<ColorField size="lg" defaultValue="#34e8a4" className="w-40" />`,
      render: () => (
        <span className="inline-flex items-end gap-3">
          <ColorField size="sm" defaultValue="#38e8ff" className="w-32" aria-label="小" />
          <ColorField size="md" defaultValue="#7c5cff" className="w-36" aria-label="中" />
          <ColorField size="lg" defaultValue="#34e8a4" className="w-40" aria-label="大" />
        </span>
      ),
    },
    {
      title: "无色块 / 禁用 / 标红",
      description:
        "showSwatch=false 只留文本；输入不可解析的值时组件自己会标红，无需外部传 invalid。",
      code: `<ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" />
<ColorField disabled defaultValue="#6b7d93" className="w-36" />
<ColorField invalid defaultValue="#ff6b6b" className="w-36" />`,
      render: () => (
        <span className="inline-flex items-center gap-3">
          <ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" aria-label="无色块" />
          <ColorField disabled defaultValue="#6b7d93" className="w-36" aria-label="禁用" />
          <ColorField invalid defaultValue="#ff6b6b" className="w-36" aria-label="标红" />
        </span>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "default", render: () => <ColorField defaultValue="#38e8ff" className="w-40" aria-label="默认" /> },
    { name: "sm", render: () => <ColorField size="sm" defaultValue="#7c5cff" className="w-32" aria-label="小" /> },
    { name: "lg", render: () => <ColorField size="lg" defaultValue="#34e8a4" className="w-40" aria-label="大" /> },
    {
      name: "no-swatch",
      render: () => <ColorField showSwatch={false} defaultValue="#38e8ff" className="w-32" aria-label="无色块" />,
    },
    { name: "disabled", render: () => <ColorField disabled defaultValue="#6b7d93" className="w-36" aria-label="禁用" /> },
    { name: "invalid", render: () => <ColorField invalid defaultValue="#ff6b6b" className="w-36" aria-label="标红" /> },
  ],
  renderWithProps: () => <ColorField defaultValue="#38e8ff" className="w-40" aria-label="主色" />,
  toCode: () => `<ColorField defaultValue="#38e8ff" className="w-40" aria-label="主色" />`,
};
