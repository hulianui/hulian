"use client";
import { Trash2 } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { Popconfirm } from "./popconfirm";

type Side = "top" | "right" | "bottom" | "left";

export const popconfirmShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
    { prop: "danger", type: "boolean", defaultValue: true, label: "危险操作" },
    { prop: "title", type: "text", defaultValue: "确定删除该条记录？", label: "标题" },
  ],
  states: [
    {
      name: "默认（危险删除确认）",
      render: () => (
        <Popconfirm title="确定删除该条记录？" description="删除后不可恢复。" danger onConfirm={() => {}}>
          <Button variant="outline" tone="danger" size="sm">
            删除
          </Button>
        </Popconfirm>
      ),
    },
    {
      name: "普通确认（无描述）",
      render: () => (
        <Popconfirm title="确认提交？" onConfirm={() => {}}>
          <Button size="sm">提交</Button>
        </Popconfirm>
      ),
    },
    {
      name: "异步确认（loading 后关闭）",
      render: () => (
        <Popconfirm
          title="确认归档？"
          description="将异步保存到服务器。"
          okText="归档"
          onConfirm={() => new Promise<void>((r) => setTimeout(r, 1200))}
        >
          <Button variant="outline" size="sm">
            归档
          </Button>
        </Popconfirm>
      ),
    },
    {
      name: "自定义图标 + 右侧弹出",
      render: () => (
        <Popconfirm
          title="移入回收站？"
          side="right"
          icon={<Trash2 className="size-5 shrink-0 text-danger" aria-hidden />}
          danger
          onConfirm={() => {}}
        >
          <Button variant="ghost" size="sm" tone="danger">
            回收
          </Button>
        </Popconfirm>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Popconfirm
      title={(p.title as string) || "确定删除该条记录？"}
      description="删除后不可恢复。"
      danger={p.danger as boolean}
      side={p.side as Side}
      onConfirm={() => {}}
    >
      <Button variant="outline" tone={(p.danger as boolean) ? "danger" : "brand"} size="sm">
        删除
      </Button>
    </Popconfirm>
  ),
  toCode: (p) =>
    `<Popconfirm\n  title="${p.title}"\n  description="删除后不可恢复。"${p.danger ? "\n  danger" : ""}\n  side="${p.side}"\n  onConfirm={async () => { await api.remove(id); }}\n>\n  <Button variant="outline" tone="danger" size="sm">删除</Button>\n</Popconfirm>`,
};
