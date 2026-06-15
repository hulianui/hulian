"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Terminal } from "./terminal";
import type { TerminalLine } from "./terminal.types";

const lines: TerminalLine[] = [
  { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
  { text: "Packages: +1", tone: "muted" },
  { text: "Progress: resolved 1, reused 1, done", tone: "muted" },
  { text: "✓ 安装完成", tone: "success" },
  { prompt: "$", text: "pnpm dev", tone: "command" },
  { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
];

const plainLines: TerminalLine[] = [
  { prompt: "$", text: "echo hello world", tone: "command" },
  { text: "hello world", tone: "muted" },
];

export const terminalShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "lines 逐行渲染，挂载即按 lineDelay 顺序淡入。",
      code: `<Terminal
  lines={[
    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
    { text: "✓ 安装完成", tone: "success" },
  ]}
/>`,
      render: () => (
        <Terminal
          lines={[
            { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
            { text: "✓ 安装完成", tone: "success" },
          ]}
        />
      ),
    },
    {
      title: "自定义标题与揭示节奏",
      description: "title 改窗口标题栏文字，lineDelay 调相邻行揭示间隔。",
      code: `<Terminal
  title="zsh"
  lineDelay={0.6}
  lines={[
    { prompt: "$", text: "pnpm dev", tone: "command" },
    { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
  ]}
/>`,
      render: () => (
        <Terminal
          title="zsh"
          lineDelay={0.6}
          lines={[
            { prompt: "$", text: "pnpm dev", tone: "command" },
            { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
          ]}
        />
      ),
    },
    {
      title: "关闭语法着色",
      description: "highlight={false} 时不拆词着色，整行走 tone 色。",
      code: `<Terminal
  highlight={false}
  lines={[
    { prompt: "$", text: "echo hello world", tone: "command" },
    { text: "hello world", tone: "muted" },
  ]}
/>`,
      render: () => <Terminal highlight={false} lines={plainLines} />,
    },
  ],
  controls: [],
  states: [{ name: "default", render: () => <Terminal lines={lines} /> }],
  renderWithProps: () => <Terminal lines={lines} />,
  toCode: () =>
    `<Terminal\n  lines={[\n    { prompt: "$", text: "pnpm dev" },\n    { text: "ready", tone: "muted" },\n  ]}\n/>`,
};
