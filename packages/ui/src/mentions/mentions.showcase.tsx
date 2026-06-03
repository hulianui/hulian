"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Mentions } from "./mentions";
import type { MentionOption } from "./mentions.types";

// 行首头像圆（首字母）——纯 token 皮肤，零依赖。
function Initial({ name }: { name: string }) {
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">
      {name.slice(0, 1)}
    </span>
  );
}

const PEOPLE: MentionOption[] = [
  { value: "u1", label: "林晓", description: "产品经理", startContent: <Initial name="林" /> },
  { value: "u2", label: "陈航", description: "前端工程师", startContent: <Initial name="陈" /> },
  { value: "u3", label: "王敏", description: "后端工程师", startContent: <Initial name="王" /> },
  { value: "u4", label: "赵磊", description: "测试", startContent: <Initial name="赵" /> },
  { value: "u5", label: "周婷", description: "设计师（休假中）", startContent: <Initial name="周" />, disabled: true },
];

export const mentionsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "prefix", type: "text", defaultValue: "@", label: "触发符" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "输入 @ 提及同事…", label: "占位符" },
    { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "default",
      render: () => (
        <Mentions
          options={PEOPLE}
          defaultValue="提醒 "
          placeholder="输入 @ 提及同事…"
          className="w-72"
        />
      ),
    },
    {
      name: "自定义触发符 #",
      render: () => (
        <Mentions
          prefix="#"
          options={[
            { value: "t1", label: "工单-1024", description: "登录失败" },
            { value: "t2", label: "工单-1031", description: "支付超时" },
            { value: "t3", label: "工单-1042", description: "数据导出" },
          ]}
          defaultValue="关联 "
          placeholder="输入 # 关联工单…"
          className="w-72"
        />
      ),
    },
    {
      name: "invalid",
      render: () => (
        <Mentions options={PEOPLE} invalid defaultValue="缺少 @负责人" className="w-72" />
      ),
    },
    {
      name: "disabled",
      render: () => (
        <Mentions options={PEOPLE} disabled defaultValue="禁用态 @林晓 " className="w-72" />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Mentions
      options={PEOPLE}
      prefix={(p.prefix as string) || "@"}
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      rows={p.rows as number}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-72"
    />
  ),
  toCode: (p) =>
    `<Mentions\n  prefix="${p.prefix}"\n  size="${p.size}"\n  options={people}\n  placeholder="${p.placeholder}"\n  rows={${p.rows}}${p.invalid ? "\n  invalid" : ""}${
      p.disabled ? "\n  disabled" : ""
    }\n  onChange={setValue}\n  onSelect={(o) => console.log(o)}\n/>`,
};
