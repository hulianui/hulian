"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SecretField } from "./secret-field";
import type { MaskStrategy } from "./secret-field.types";

const SAMPLE = "sk-hanhub-7f3a9c2e1b8d4056af12cd34ef56ab78";

export const secretFieldShowcase: ShowcaseSpec = {
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
