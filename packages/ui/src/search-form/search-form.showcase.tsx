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
  controls: [{ prop: "collapsible", type: "boolean", defaultValue: true }],
  states: [
    { name: "默认折叠", render: () => <Demo /> },
    { name: "少字段(不可折叠)", render: () => <Demo collapsible={false} /> },
  ],
  renderWithProps: (p) => <Demo collapsible={Boolean(p.collapsible)} />,
  toCode: () =>
    `<SearchForm\n  fields={fields}\n  values={values}\n  onChange={setValues}\n  onSearch={(v) => console.log(v)}\n  onReset={() => {}}\n/>`,
};
