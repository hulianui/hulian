"use client";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Share2 } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "./toolbar";

function Demo() {
  return (
    <Toolbar aria-label="文本格式">
      <ToolbarGroup>
        <ToolbarButton aria-label="加粗"><Bold className="size-4" /></ToolbarButton>
        <ToolbarButton aria-label="斜体"><Italic className="size-4" /></ToolbarButton>
        <ToolbarButton aria-label="下划线"><Underline className="size-4" /></ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton aria-label="左对齐"><AlignLeft className="size-4" /></ToolbarButton>
        <ToolbarButton aria-label="居中"><AlignCenter className="size-4" /></ToolbarButton>
        <ToolbarButton aria-label="右对齐"><AlignRight className="size-4" /></ToolbarButton>
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
    `<Toolbar aria-label="文本格式">\n  <ToolbarGroup>\n    <ToolbarButton aria-label="加粗"><Bold /></ToolbarButton>\n  </ToolbarGroup>\n  <ToolbarSeparator />\n  <ToolbarButton aria-label="分享"><Share2 />分享</ToolbarButton>\n</Toolbar>`,
};
