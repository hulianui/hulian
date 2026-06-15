"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SecretField } from "./secret-field";
import type { MaskStrategy } from "./secret-field.types";

const SAMPLE = "sk-hanhub-7f3a9c2e1b8d4056af12cd34ef56ab78";

export const secretFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认掩码 sk-xxx…xxxx，点眼睛显形、点复制取原值。",
      code: `<SecretField value="sk-hanhub-7f3a9c2e1b8d4056af12cd34ef56ab78" />`,
      render: () => <SecretField value={SAMPLE} />,
    },
    {
      title: "全掩码",
      description: 'maskStrategy="full" 完全隐藏，不泄露首尾结构。',
      code: `<SecretField value={apiKey} maskStrategy="full" />`,
      render: () => <SecretField value={SAMPLE} maskStrategy="full" />,
    },
    {
      title: "只读不可复制",
      description: "去掉交互描边、隐藏复制按钮，纯展示场景。",
      code: `<SecretField value={apiKey} readOnly copyable={false} />`,
      render: () => <SecretField value={SAMPLE} readOnly copyable={false} />,
    },
    {
      title: "尾部动作槽",
      description: "actions 槽位挂吊销/重置按钮，与显示/复制并排。",
      code: `<SecretField
  value={apiKey}
  actions={
    <button type="button" className="px-1.5 text-xs text-danger">
      吊销
    </button>
  }
/>`,
      render: () => (
        <SecretField
          value={SAMPLE}
          actions={
            <button type="button" className="px-1.5 text-xs text-danger">
              吊销
            </button>
          }
        />
      ),
    },
    {
      title: "尺寸",
      description: 'size="sm" 适配密集表格行内。',
      code: `<SecretField value={apiKey} size="sm" />`,
      render: () => <SecretField value={SAMPLE} size="sm" />,
    },
  ],
  controls: [
    {
      prop: "maskStrategy",
      type: "select",
      options: ["prefix-suffix", "full"],
      defaultValue: "prefix-suffix",
      label: "掩码",
    },
    { prop: "copyable", type: "boolean", defaultValue: true, label: "可复制" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "默认掩码", render: () => <SecretField value={SAMPLE} /> },
    { name: "全掩", render: () => <SecretField value={SAMPLE} maskStrategy="full" /> },
    { name: "受控显形", render: () => <SecretField value={SAMPLE} revealed /> },
    { name: "不可复制", render: () => <SecretField value={SAMPLE} copyable={false} /> },
    { name: "sm", render: () => <SecretField value={SAMPLE} size="sm" /> },
  ],
  renderWithProps: (p) => (
    <SecretField
      value={SAMPLE}
      maskStrategy={p.maskStrategy as MaskStrategy}
      copyable={p.copyable as boolean}
      readOnly={p.readOnly as boolean}
    />
  ),
  toCode: (p) =>
    `<SecretField value={apiKey} maskStrategy="${p.maskStrategy}"${p.copyable ? "" : " copyable={false}"}${p.readOnly ? " readOnly" : ""} />`,
};
