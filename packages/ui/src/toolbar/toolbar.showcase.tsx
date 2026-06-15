"use client";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Share2 } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator } from "./toolbar";

function Demo() {
  return (
    <Toolbar aria-label="文本格式">
      <ToolbarGroup>
        <ToolbarToggle aria-label="加粗" defaultPressed><Bold className="size-4" /></ToolbarToggle>
        <ToolbarToggle aria-label="斜体"><Italic className="size-4" /></ToolbarToggle>
        <ToolbarToggle aria-label="下划线"><Underline className="size-4" /></ToolbarToggle>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarToggle aria-label="左对齐" defaultPressed><AlignLeft className="size-4" /></ToolbarToggle>
        <ToolbarToggle aria-label="居中"><AlignCenter className="size-4" /></ToolbarToggle>
        <ToolbarToggle aria-label="右对齐"><AlignRight className="size-4" /></ToolbarToggle>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label="分享"><Share2 className="size-4" />分享</ToolbarButton>
    </Toolbar>
  );
}

export const toolbarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "role=toolbar 容器内置键盘漫游（方向键移动焦点）。ToolbarButton 为普通按钮。",
      code: `<Toolbar aria-label="文本格式">
  <ToolbarButton aria-label="分享"><Share2 className="size-4" />分享</ToolbarButton>
</Toolbar>`,
      render: () => (
        <Toolbar aria-label="文本格式">
          <ToolbarButton aria-label="分享">
            <Share2 className="size-4" />
            分享
          </ToolbarButton>
        </Toolbar>
      ),
    },
    {
      title: "可切换按钮",
      description: "ToolbarToggle 为非受控开关，defaultPressed 设初始选中。选中态用主色填充，区别于 hover。",
      code: `<Toolbar aria-label="文本格式">
  <ToolbarToggle aria-label="加粗" defaultPressed><Bold className="size-4" /></ToolbarToggle>
  <ToolbarToggle aria-label="斜体"><Italic className="size-4" /></ToolbarToggle>
  <ToolbarToggle aria-label="下划线"><Underline className="size-4" /></ToolbarToggle>
</Toolbar>`,
      render: () => (
        <Toolbar aria-label="文本格式">
          <ToolbarToggle aria-label="加粗" defaultPressed>
            <Bold className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle aria-label="斜体">
            <Italic className="size-4" />
          </ToolbarToggle>
          <ToolbarToggle aria-label="下划线">
            <Underline className="size-4" />
          </ToolbarToggle>
        </Toolbar>
      ),
    },
    {
      title: "分组 + 分隔符",
      description: "ToolbarGroup 聚合相关按钮，ToolbarSeparator 在组间插入竖线分隔。",
      code: `<Toolbar aria-label="文本格式">
  <ToolbarGroup>
    <ToolbarToggle aria-label="加粗" defaultPressed><Bold className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="斜体"><Italic className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <ToolbarToggle aria-label="左对齐" defaultPressed><AlignLeft className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="居中"><AlignCenter className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="右对齐"><AlignRight className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton aria-label="分享"><Share2 className="size-4" />分享</ToolbarButton>
</Toolbar>`,
      render: () => <Demo />,
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Toolbar aria-label="文本格式">\n  <ToolbarGroup>\n    <ToolbarToggle aria-label="加粗" defaultPressed><Bold /></ToolbarToggle>\n  </ToolbarGroup>\n  <ToolbarSeparator />\n  <ToolbarButton aria-label="分享"><Share2 />分享</ToolbarButton>\n</Toolbar>`,
};
