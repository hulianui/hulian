"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./select";

type Side = "top" | "bottom";
type Size = "sm" | "md" | "lg";

const FONTS = [
  { value: "sans", label: "无衬线 Sans" },
  { value: "serif", label: "衬线 Serif" },
  { value: "mono", label: "等宽 Mono" },
  { value: "cursive", label: "手写 Cursive" },
];

function Demo({
  placeholder = "请选择字体",
  size = "md",
  disabled = false,
  invalid = false,
  side = "bottom",
  defaultValue,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  side?: Side;
  defaultValue?: string;
}) {
  return (
    <div className="w-60">
      <Select items={FONTS} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger size={size} invalid={invalid} />
        <SelectContent side={side}>
          {FONTS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const selectShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "items 提供选项数据，placeholder 作占位。",
      code: `<Select items={fonts} placeholder="请选择字体">
  <SelectTrigger />
  <SelectContent>
    {fonts.map((f) => (
      <SelectItem key={f.value} value={f.value}>
        {f.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>`,
      render: () => <Demo />,
    },
    {
      title: "默认已选值",
      description: "非受控写法用 defaultValue 预设选中项。",
      code: `<Select items={fonts} defaultValue="serif">
  <SelectTrigger />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo defaultValue="serif" />,
    },
    {
      title: "尺寸",
      description: "SelectTrigger 的 size 提供 sm / md / lg。",
      code: `<Select items={fonts} defaultValue="mono">
  <SelectTrigger size="sm" />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo size="sm" defaultValue="mono" />,
    },
    {
      title: "无效态",
      description: "SelectTrigger 传 invalid 标红（独立使用时）。",
      code: `<Select items={fonts} placeholder="请选择字体">
  <SelectTrigger invalid />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo invalid />,
    },
    {
      title: "禁用态",
      description: "Select 传 disabled 屏蔽整个下拉。",
      code: `<Select items={fonts} defaultValue="sans" disabled>
  <SelectTrigger />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo disabled defaultValue="sans" />,
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "请选择字体", label: "占位文案" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "side", type: "select", options: ["bottom", "top"], defaultValue: "bottom" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "已选值", render: () => <Demo defaultValue="serif" /> },
    { name: "禁用", render: () => <Demo disabled defaultValue="sans" /> },
    { name: "无效态", render: () => <Demo invalid /> },
    { name: "向上弹", render: () => <Demo side="top" placeholder="向上展开" /> },
    { name: "small", render: () => <Demo size="sm" defaultValue="mono" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={p.placeholder as string}
      size={p.size as Size}
      side={p.side as Side}
      disabled={p.disabled as boolean}
      invalid={p.invalid as boolean}
    />
  ),
  toCode: (p) =>
    `<Select items={items} placeholder="${p.placeholder}" defaultValue="…">\n  <SelectTrigger size="${p.size}" />\n  <SelectContent side="${p.side}">\n    {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}\n  </SelectContent>\n</Select>`,
};
