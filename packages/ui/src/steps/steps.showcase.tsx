"use client";
import { useState } from "react";
import { Button } from "../button";
import type { ShowcaseSpec } from "../showcase/types";
import { Steps } from "./steps";
import type { StepsItem } from "./steps.types";

const ORDER: StepsItem[] = [
  { title: "提交申请", description: "填写报销单据" },
  { title: "部门审批", description: "主管复核金额" },
  { title: "财务打款", description: "对公转账" },
  { title: "完成", description: "归档结案" },
];

function Interactive() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <Steps items={ORDER} current={current} onChange={setCurrent} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          上一步
        </Button>
        <Button size="sm" disabled={current === ORDER.length - 1} onClick={() => setCurrent((c) => c + 1)}>
          下一步
        </Button>
      </div>
    </div>
  );
}

export const stepsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "current", type: "number", defaultValue: 1 },
    { prop: "direction", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
    { prop: "status", type: "select", options: ["process", "finish", "error"], defaultValue: "process" },
    { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
  ],
  states: [
    {
      name: "水平（进行中）",
      render: () => (
        <div className="w-full max-w-xl">
          <Steps items={ORDER} current={1} />
        </div>
      ),
    },
    {
      name: "错误态",
      render: () => (
        <div className="w-full max-w-xl">
          <Steps items={ORDER} current={2} status="error" />
        </div>
      ),
    },
    {
      name: "垂直",
      render: () => (
        <div className="w-full max-w-md">
          <Steps direction="vertical" items={ORDER} current={2} />
        </div>
      ),
    },
    {
      name: "小尺寸",
      render: () => (
        <div className="w-full max-w-lg">
          <Steps size="sm" items={ORDER} current={1} />
        </div>
      ),
    },
    {
      name: "可点击 + 受控",
      render: () => <Interactive />,
    },
  ],
  renderWithProps: (p) => (
    <div className={(p.direction as string) === "vertical" ? "w-full max-w-xs" : "w-full max-w-xl"}>
      <Steps
        items={ORDER}
        current={Number(p.current ?? 1)}
        direction={(p.direction as "horizontal" | "vertical") ?? "horizontal"}
        status={(p.status as "process" | "finish" | "error") ?? "process"}
        size={(p.size as "md" | "sm") ?? "md"}
      />
    </div>
  ),
  toCode: (p) =>
    `<Steps\n  current={${Number(p.current ?? 1)}}${p.direction && p.direction !== "horizontal" ? `\n  direction="${p.direction}"` : ""}${p.status && p.status !== "process" ? `\n  status="${p.status}"` : ""}${p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""}\n  items={[\n    { title: "提交申请", description: "填写报销单据" },\n    { title: "部门审批", description: "主管复核金额" },\n    { title: "财务打款", description: "对公转账" },\n    { title: "完成", description: "归档结案" },\n  ]}\n/>`,
};
