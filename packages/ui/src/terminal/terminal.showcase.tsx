"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Terminal } from "./terminal";
import type { TerminalLine } from "./terminal.types";

const lines: TerminalLine[] = [
  { prompt: "$", text: "pnpm add @hulian/ui", tone: "command" },
  { text: "Packages: +1", tone: "muted" },
  { text: "Progress: resolved 1, reused 1, done", tone: "muted" },
  { text: "✓ 安装完成", tone: "success" },
  { prompt: "$", text: "pnpm dev", tone: "command" },
  { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
];

export const terminalShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "default", render: () => <Terminal lines={lines} /> }],
  renderWithProps: () => <Terminal lines={lines} />,
  toCode: () =>
    `<Terminal\n  lines={[\n    { prompt: "$", text: "pnpm dev" },\n    { text: "ready", tone: "muted" },\n  ]}\n/>`,
};
