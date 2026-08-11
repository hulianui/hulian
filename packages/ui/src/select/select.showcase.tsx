"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
} from "./select";

type Side = "top" | "bottom";
type Size = "sm" | "md" | "lg";

const FONTS = [
  { value: "sans", label: "无衬线 Sans" },
  { value: "serif", label: "衬线 Serif" },
  { value: "mono", label: "等宽 Mono" },
  { value: "cursive", label: "手写 Cursive" },
];

const GROUPED = [
  { group: "西文", items: [FONTS[0]!, FONTS[1]!] },
  { group: "代码 / 手写", items: [FONTS[2]!, FONTS[3]!] },
];

function Demo({
  placeholder = "请选择字体",
  size = "md",
  disabled = false,
  invalid = false,
  side = "bottom",
  defaultValue,
  clearable = false,
  searchable = false,
  loading = false,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  side?: Side;
  defaultValue?: string;
  clearable?: boolean;
  searchable?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="w-60">
      <Select
        items={FONTS}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        clearable={clearable}
        searchable={searchable}
        loading={loading}
      >
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

function GroupDemo() {
  return (
    <div className="w-60">
      <Select items={FONTS} placeholder="请选择字体">
        <SelectTrigger />
        <SelectContent>
          {GROUPED.map((g) => (
            <SelectGroup key={g.group}>
              <SelectGroupLabel>{g.group}</SelectGroupLabel>
              {g.items.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MultiDemo({ defaultValue = [] as string[], maxDisplay }: { defaultValue?: string[]; maxDisplay?: number }) {
  const [value, setValue] = useState<string[]>(defaultValue);
  return (
    <div className="w-60">
      <Select items={FONTS} placeholder="选择多个字体" multiple value={value} onValueChange={setValue}>
        <SelectTrigger maxDisplay={maxDisplay} />
        <SelectContent>
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
      title: "多选",
      description: "multiple 下受控值为 string[]，Trigger 平铺已选 label（超出 maxDisplay 折叠 +N），选中后浮层保持打开。",
      code: `const [value, setValue] = useState<string[]>([]);

<Select items={fonts} placeholder="选择多个字体" multiple value={value} onValueChange={setValue}>
  <SelectTrigger maxDisplay={2} />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <MultiDemo defaultValue={["sans", "serif", "mono"]} maxDisplay={2} />,
    },
    {
      title: "可清除",
      description: "clearable 下有值时 hover / 聚焦字段，右侧箭头位浮出清除按钮；点击置空并回传 null（多选回传 []）。",
      code: `<Select items={fonts} placeholder="请选择字体" clearable defaultValue="serif">
  <SelectTrigger />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo clearable defaultValue="serif" />,
    },
    {
      title: "可搜索",
      description: "searchable 切到 Combobox 搜索皮肤：浮层顶部带搜索框，过滤复用 Base UI Combobox（对标 el-select filterable）。",
      code: `<Select items={fonts} placeholder="请选择字体" searchable clearable>
  <SelectTrigger />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo searchable clearable defaultValue="serif" />,
    },
    {
      title: "加载态",
      description: "loading 下 Trigger 图标换 Spinner，浮层只出加载占位（不展示上一轮的陈旧选项）。",
      code: `<Select items={fonts} placeholder="请选择字体" loading loadingText="加载中">
  <SelectTrigger />
  <SelectContent>{/* SelectItem… */}</SelectContent>
</Select>`,
      render: () => <Demo loading />,
    },
    {
      title: "选项分组",
      description: "SelectGroup + SelectGroupLabel 给选项分段（Base UI 自动建立 aria 关联）。searchable 皮肤下分组会被拍平。",
      code: `<SelectContent>
  <SelectGroup>
    <SelectGroupLabel>西文</SelectGroupLabel>
    <SelectItem value="sans">无衬线 Sans</SelectItem>
    <SelectItem value="serif">衬线 Serif</SelectItem>
  </SelectGroup>
</SelectContent>`,
      render: () => <GroupDemo />,
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
    { prop: "size", type: "select", options: ["xs", "sm", "md", "lg"], defaultValue: "md" },
    { prop: "side", type: "select", options: ["bottom", "top"], defaultValue: "bottom" },
    { prop: "clearable", type: "boolean", defaultValue: false, label: "可清除" },
    { prop: "searchable", type: "boolean", defaultValue: false, label: "可搜索" },
    { prop: "loading", type: "boolean", defaultValue: false, label: "加载态" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "已选值", render: () => <Demo defaultValue="serif" /> },
    { name: "可清除", render: () => <Demo clearable defaultValue="serif" /> },
    { name: "可搜索", render: () => <Demo searchable defaultValue="serif" /> },
    { name: "加载中", render: () => <Demo loading /> },
    { name: "分组", render: () => <GroupDemo /> },
    { name: "多选（超出折叠 +N）", render: () => <MultiDemo defaultValue={["sans", "serif", "mono"]} /> },
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
      clearable={p.clearable as boolean}
      searchable={p.searchable as boolean}
      loading={p.loading as boolean}
      defaultValue={p.clearable ? "serif" : undefined}
    />
  ),
  toCode: (p) => {
    const flags = [p.clearable && " clearable", p.searchable && " searchable", p.loading && " loading"]
      .filter(Boolean)
      .join("");
    return `<Select items={items} placeholder="${p.placeholder}"${flags} defaultValue="…">\n  <SelectTrigger size="${p.size}" />\n  <SelectContent side="${p.side}">\n    {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}\n  </SelectContent>\n</Select>`;
  },
};
