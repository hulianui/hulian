"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Empty } from "./empty";

export const emptyShowcase: ShowcaseSpec = {
  controls: [
    { prop: "title", type: "text", defaultValue: "暂无数据" },
    { prop: "description", type: "text", defaultValue: "当前列表还没有任何内容" },
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
  ],
  states: [
    {
      name: "默认",
      render: () => <Empty title="暂无数据" description="当前列表还没有任何内容" />,
    },
    {
      name: "带操作",
      render: () => (
        <Empty title="还没有项目" description="创建第一个项目开始使用">
          <Button size="sm">新建项目</Button>
        </Empty>
      ),
    },
    {
      name: "small",
      render: () => <Empty size="sm" title="无结果" description="试试其他关键词" />,
    },
  ],
  renderWithProps: (p) => (
    <Empty
      title={(p.title as string) || undefined}
      description={(p.description as string) || undefined}
      size={(p.size as "sm" | "md") ?? "md"}
    />
  ),
  toCode: (p) =>
    `<Empty\n  title="${(p.title as string) ?? "暂无数据"}"\n  description="${
      (p.description as string) ?? ""
    }"\n  size="${(p.size as string) ?? "md"}"\n/>`,
};
