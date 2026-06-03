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
  controls: [],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Toolbar aria-label="文本格式">\n  <ToolbarGroup>\n    <ToolbarToggle aria-label="加粗" defaultPressed><Bold /></ToolbarToggle>\n  </ToolbarGroup>\n  <ToolbarSeparator />\n  <ToolbarButton aria-label="分享"><Share2 />分享</ToolbarButton>\n</Toolbar>`,
};
