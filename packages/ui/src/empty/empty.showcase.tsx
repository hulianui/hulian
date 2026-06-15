"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Empty } from "./empty";

export const emptyShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "内置空箱图标 + 标题 + 描述。",
      code: `<Empty title="暂无数据" description="当前列表还没有任何内容" />`,
      render: () => <Empty title="暂无数据" description="当前列表还没有任何内容" />,
    },
    {
      title: "带操作",
      description: "children 渲染在描述下方，常放引导按钮。",
      code: `<Empty title="还没有项目" description="创建第一个项目开始使用">
  <Button size="sm">新建项目</Button>
</Empty>`,
      render: () => (
        <Empty title="还没有项目" description="创建第一个项目开始使用">
          <Button size="sm">新建项目</Button>
        </Empty>
      ),
    },
    {
      title: "小尺寸",
      description: "size=\"sm\" 收紧间距与字号，适合卡片内 / 下拉空态。",
      code: `<Empty size="sm" title="无结果" description="试试其他关键词" />`,
      render: () => <Empty size="sm" title="无结果" description="试试其他关键词" />,
    },
    {
      title: "无图标",
      description: "icon={null} 隐藏图标区，只留文案。",
      code: `<Empty icon={null} title="暂无通知" description="有新消息时会出现在这里" />`,
      render: () => <Empty icon={null} title="暂无通知" description="有新消息时会出现在这里" />,
    },
  ],
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
