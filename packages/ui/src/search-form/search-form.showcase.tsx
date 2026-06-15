"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { SearchForm } from "./search-form";
import type { SearchField } from "./search-form.types";

const fields: SearchField[] = [
  { name: "keyword", label: "关键词", placeholder: "订单号 / 客户名" },
  {
    name: "status",
    label: "状态",
    type: "select",
    placeholder: "全部",
    options: [
      { value: "pending", label: "待处理" },
      { value: "done", label: "已完成" },
      { value: "canceled", label: "已取消" },
    ],
  },
  {
    name: "channel",
    label: "渠道",
    type: "select",
    placeholder: "全部",
    options: [
      { value: "app", label: "APP" },
      { value: "web", label: "网页" },
      { value: "wechat", label: "微信" },
    ],
  },
  { name: "range", label: "创建时间", type: "date-range", colSpan: 2 },
  { name: "owner", label: "负责人", placeholder: "姓名" },
  { name: "city", label: "城市", placeholder: "城市" },
];

function Demo({ collapsible = true }: { collapsible?: boolean }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [searched, setSearched] = useState<string | null>(null);
  return (
    <div className="w-[44rem] max-w-full space-y-3">
      <SearchForm
        fields={collapsible ? fields : fields.slice(0, 3)}
        values={values}
        onChange={setValues}
        onSearch={(v) => setSearched(JSON.stringify(v))}
        onReset={() => setSearched(null)}
        collapsible={collapsible}
      />
      {searched && <p className="text-xs text-muted">查询参数：{searched}</p>}
    </div>
  );
}

export const searchFormShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "fields 配置驱动；省略 values/onChange 走内部非受控态。回车 / 查询触发 onSearch。",
      code: `<SearchForm
  fields={[
    { name: "keyword", label: "关键词", placeholder: "订单号 / 客户名" },
    { name: "status", label: "状态", type: "select", placeholder: "全部",
      options: [{ value: "pending", label: "待处理" }, { value: "done", label: "已完成" }] },
    { name: "owner", label: "负责人", placeholder: "姓名" },
  ]}
  onSearch={(v) => console.log(v)}
  onReset={() => {}}
/>`,
      render: () => (
        <div className="w-[44rem] max-w-full">
          <SearchForm fields={fields.slice(0, 3)} onSearch={() => {}} onReset={() => {}} />
        </div>
      ),
    },
    {
      title: "可折叠 + 跨列",
      description: "字段填满多行时可折叠（默认收起仅显首行）；date-range 用 colSpan 跨两列。",
      code: `<SearchForm
  fields={fields}            // 6+ 字段
  collapsible                // 字段够多自动启用「展开/收起」
  onSearch={(v) => console.log(v)}
/>`,
      render: () => (
        <div className="w-[44rem] max-w-full">
          <SearchForm fields={fields} collapsible onSearch={() => {}} onReset={() => {}} />
        </div>
      ),
    },
    {
      title: "自定义列数与文案",
      description: "columns 控制桌面列数，submitText / resetText 覆盖按钮文案。",
      code: `<SearchForm
  fields={fields}
  columns={2}
  submitText="搜索"
  resetText="清空"
  onSearch={(v) => console.log(v)}
/>`,
      render: () => (
        <div className="w-[44rem] max-w-full">
          <SearchForm
            fields={fields.slice(0, 3)}
            columns={2}
            submitText="搜索"
            resetText="清空"
            onSearch={() => {}}
            onReset={() => {}}
          />
        </div>
      ),
    },
  ],
  controls: [{ prop: "collapsible", type: "boolean", defaultValue: true }],
  states: [
    { name: "默认折叠", render: () => <Demo /> },
    { name: "少字段(不可折叠)", render: () => <Demo collapsible={false} /> },
  ],
  renderWithProps: (p) => <Demo collapsible={Boolean(p.collapsible)} />,
  toCode: () =>
    `<SearchForm\n  fields={fields}\n  values={values}\n  onChange={setValues}\n  onSearch={(v) => console.log(v)}\n  onReset={() => {}}\n/>`,
};
