"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem } from "./combobox";
import type { ComboboxItemData } from "./combobox.types";

type Size = "sm" | "md" | "lg";

const FRUITS: ComboboxItemData[] = [
  { value: "apple", label: "苹果 Apple" },
  { value: "banana", label: "香蕉 Banana" },
  { value: "cherry", label: "樱桃 Cherry" },
  { value: "durian", label: "榴莲 Durian" },
  { value: "grape", label: "葡萄 Grape" },
  { value: "lemon", label: "柠檬 Lemon" },
  { value: "mango", label: "芒果 Mango" },
  { value: "orange", label: "橙子 Orange" },
];

// 图4 范式：触发按钮 + 弹层内置搜索框。
function Demo({
  placeholder = "选择水果",
  searchPlaceholder = "搜索水果…",
  size = "md",
  disabled = false,
  invalid = false,
  defaultValue,
}: {
  placeholder?: string;
  searchPlaceholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  defaultValue?: ComboboxItemData;
}) {
  return (
    <div className="w-60">
      <Combobox items={FRUITS} defaultValue={defaultValue} disabled={disabled}>
        <ComboboxTrigger size={size} placeholder={placeholder} invalid={invalid} />
        <ComboboxContent searchPlaceholder={searchPlaceholder}>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

// 内联自动补全：输入框本身即可见字段，直接打字过滤（浮层锚到外壳、与字段等宽）。
function InlineDemo() {
  return (
    <div className="w-60">
      <Combobox items={FRUITS}>
        <ComboboxInput placeholder="搜索水果…" clearable />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export const comboboxShowcase: ShowcaseSpec = {
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "选择水果", label: "占位文案" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "已选值", render: () => <Demo defaultValue={FRUITS[2]} /> },
    { name: "禁用", render: () => <Demo disabled defaultValue={FRUITS[0]} /> },
    { name: "无效态", render: () => <Demo invalid /> },
    { name: "small", render: () => <Demo size="sm" /> },
    { name: "内联自动补全", render: () => <InlineDemo /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={p.placeholder as string}
      size={p.size as Size}
      disabled={p.disabled as boolean}
      invalid={p.invalid as boolean}
    />
  ),
  toCode: (p) =>
    `<Combobox items={items} defaultValue={items[0]}>\n  <ComboboxTrigger size="${p.size}" placeholder="${p.placeholder}" />\n  <ComboboxContent searchPlaceholder="搜索水果…">\n    {(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}\n  </ComboboxContent>\n</Combobox>`,
};
