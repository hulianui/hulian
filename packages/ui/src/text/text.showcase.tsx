"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Text } from "./text";
import type { TextSize, TextTone, TextWeight } from "./text.types";

const longLine =
  "瑚琏设计系统的 Text 组件支持单行省略号与多行截断，这段文本足够长以触发截断效果观察省略号位置。";

export const textShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "tone",
      type: "select",
      options: ["default", "muted", "primary", "danger"],
      defaultValue: "default",
      label: "色调",
    },
    {
      prop: "size",
      type: "select",
      options: ["xs", "sm", "base", "lg", "xl"],
      defaultValue: "base",
      label: "字号",
    },
    {
      prop: "weight",
      type: "select",
      options: ["normal", "medium", "semibold", "bold"],
      defaultValue: "normal",
      label: "字重",
    },
    { prop: "truncate", type: "boolean", defaultValue: false, label: "单行省略" },
  ],
  states: [
    {
      name: "色调（语义 token，明暗自适配）",
      render: () => (
        <div className="flex flex-col gap-1.5">
          <Text>默认正文 default · text-foreground</Text>
          <Text tone="muted">辅助说明 muted · text-muted</Text>
          <Text tone="primary">强调文本 primary · text-primary</Text>
          <Text tone="danger">危险提示 danger · text-danger</Text>
        </div>
      ),
    },
    {
      name: "字号阶梯",
      render: () => (
        <div className="flex flex-col gap-1.5">
          <Text size="xs">xs · 最小辅助字号</Text>
          <Text size="sm">sm · 次要字号</Text>
          <Text size="base">base · 正文基准</Text>
          <Text size="lg">lg · 偏大正文</Text>
          <Text size="xl">xl · 引导语字号</Text>
        </div>
      ),
    },
    {
      name: "单行省略号（容器收窄）",
      render: () => (
        <div className="max-w-xs">
          <Text truncate>{longLine}</Text>
        </div>
      ),
    },
    {
      name: "多行截断（lineClamp=2）",
      render: () => (
        <div className="max-w-xs">
          <Text tone="muted" lineClamp={2}>
            {longLine}
            {longLine}
          </Text>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Text
      tone={p.tone as TextTone}
      size={p.size as TextSize}
      weight={p.weight as TextWeight}
      truncate={Boolean(p.truncate)}
      className={p.truncate ? "max-w-xs" : undefined}
    >
      {p.truncate ? longLine : "瑚琏 Text 多态文本原语"}
    </Text>
  ),
  toCode: (p) => {
    const attrs = [
      p.tone !== "default" ? ` tone="${p.tone}"` : "",
      p.size !== "base" ? ` size="${p.size}"` : "",
      p.weight !== "normal" ? ` weight="${p.weight}"` : "",
      p.truncate ? " truncate" : "",
    ].join("");
    return `<Text${attrs}>瑚琏 Text 多态文本原语</Text>`;
  },
};
