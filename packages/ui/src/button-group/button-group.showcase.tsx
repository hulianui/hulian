"use client";
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, ChevronDown, Plus, Minus } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { ButtonGroup } from "./button-group";
import { Button } from "../button/button";

export const buttonGroupShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "连排图标组",
      description: "默认 attached：子按钮贴合成一体，内侧圆角抹平、边框合并。子项 variant 建议一致。",
      code: `<ButtonGroup aria-label="对齐方式">
  <Button variant="outline" size="icon" aria-label="左对齐"><AlignLeft className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="居中"><AlignCenter className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="右对齐"><AlignRight className="size-4" /></Button>
</ButtonGroup>`,
      render: () => (
        <ButtonGroup aria-label="对齐方式">
          <Button variant="outline" size="icon" aria-label="左对齐"><AlignLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="居中"><AlignCenter className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="右对齐"><AlignRight className="size-4" /></Button>
        </ButtonGroup>
      ),
    },
    {
      title: "图标 + 文字分段",
      description: "工具栏式分段操作，每段图标配文案。",
      code: `<ButtonGroup aria-label="文本格式">
  <Button variant="outline"><Bold className="size-4" />加粗</Button>
  <Button variant="outline"><Italic className="size-4" />斜体</Button>
  <Button variant="outline"><Underline className="size-4" />下划线</Button>
</ButtonGroup>`,
      render: () => (
        <ButtonGroup aria-label="文本格式">
          <Button variant="outline"><Bold className="size-4" />加粗</Button>
          <Button variant="outline"><Italic className="size-4" />斜体</Button>
          <Button variant="outline"><Underline className="size-4" />下划线</Button>
        </ButtonGroup>
      ),
    },
    {
      title: "拆分按钮",
      description: "主操作 + 一个下拉触发的「更多」，常见于保存 / 提交场景。",
      code: `<ButtonGroup aria-label="保存">
  <Button>保存</Button>
  <Button size="icon" aria-label="更多保存选项"><ChevronDown className="size-4" /></Button>
</ButtonGroup>`,
      render: () => (
        <ButtonGroup aria-label="保存">
          <Button>保存</Button>
          <Button size="icon" aria-label="更多保存选项"><ChevronDown className="size-4" /></Button>
        </ButtonGroup>
      ),
    },
    {
      title: "纵向排列",
      description: "orientation=\"vertical\" 改为上下连排，抹平上下内侧圆角。",
      code: `<ButtonGroup orientation="vertical" aria-label="工具">
  <Button variant="outline">复制</Button>
  <Button variant="outline">粘贴</Button>
  <Button variant="outline">删除</Button>
</ButtonGroup>`,
      render: () => (
        <ButtonGroup orientation="vertical" aria-label="工具">
          <Button variant="outline">复制</Button>
          <Button variant="outline">粘贴</Button>
          <Button variant="outline">删除</Button>
        </ButtonGroup>
      ),
    },
    {
      title: "分离分组",
      description: "attached={false} 时子按钮间留 gap，仅作语义/对齐分组，不贴合。",
      code: `<ButtonGroup attached={false} aria-label="操作">
  <Button variant="outline">取消</Button>
  <Button>确定</Button>
</ButtonGroup>`,
      render: () => (
        <ButtonGroup attached={false} aria-label="操作">
          <Button variant="outline">取消</Button>
          <Button>确定</Button>
        </ButtonGroup>
      ),
    },
  ],
  controls: [
    { prop: "orientation", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
    { prop: "attached", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "连排（outline）",
      render: () => (
        <ButtonGroup aria-label="对齐方式">
          <Button variant="outline" size="icon" aria-label="左对齐"><AlignLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="居中"><AlignCenter className="size-4" /></Button>
          <Button variant="outline" size="icon" aria-label="右对齐"><AlignRight className="size-4" /></Button>
        </ButtonGroup>
      ),
    },
    {
      name: "文字 + 图标分段",
      render: () => (
        <ButtonGroup aria-label="文本格式">
          <Button variant="outline"><Bold className="size-4" />加粗</Button>
          <Button variant="outline"><Italic className="size-4" />斜体</Button>
          <Button variant="outline"><Underline className="size-4" />下划线</Button>
        </ButtonGroup>
      ),
    },
    {
      name: "拆分按钮（主操作 + 更多）",
      render: () => (
        <ButtonGroup aria-label="保存">
          <Button>保存</Button>
          <Button size="icon" aria-label="更多保存选项"><ChevronDown className="size-4" /></Button>
        </ButtonGroup>
      ),
    },
    {
      name: "步进器",
      render: () => (
        <ButtonGroup aria-label="数量">
          <Button variant="outline" size="icon" aria-label="减少"><Minus className="size-4" /></Button>
          <Button variant="outline" className="pointer-events-none min-w-12 tabular-nums">3</Button>
          <Button variant="outline" size="icon" aria-label="增加"><Plus className="size-4" /></Button>
        </ButtonGroup>
      ),
    },
    {
      name: "纵向",
      render: () => (
        <ButtonGroup orientation="vertical" aria-label="工具">
          <Button variant="outline">复制</Button>
          <Button variant="outline">粘贴</Button>
          <Button variant="outline">删除</Button>
        </ButtonGroup>
      ),
    },
    {
      name: "分离（attached=false）",
      render: () => (
        <ButtonGroup attached={false} aria-label="操作">
          <Button variant="outline">取消</Button>
          <Button>确定</Button>
        </ButtonGroup>
      ),
    },
  ],
  renderWithProps: (p) => (
    <ButtonGroup
      orientation={(p.orientation as "horizontal" | "vertical") ?? "horizontal"}
      attached={p.attached as boolean}
      aria-label="示例"
    >
      <Button variant="outline">一</Button>
      <Button variant="outline">二</Button>
      <Button variant="outline">三</Button>
    </ButtonGroup>
  ),
  toCode: (p) =>
    `<ButtonGroup${p.orientation && p.orientation !== "horizontal" ? ` orientation="${p.orientation}"` : ""}${p.attached === false ? " attached={false}" : ""}>\n  <Button variant="outline">一</Button>\n  <Button variant="outline">二</Button>\n  <Button variant="outline">三</Button>\n</ButtonGroup>`,
};
