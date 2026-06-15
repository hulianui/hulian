"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { LogViewer } from "./log-viewer";
import type { LogLine } from "./log-viewer.types";

const STATIC: LogLine[] = [
  { level: "command", timestamp: "12:00:01", message: "▸ npm run build" },
  { level: "debug", timestamp: "12:00:01", source: "[turbo]", message: "scope: 1 package" },
  { level: "info", timestamp: "12:00:02", message: "compiling 248 modules…" },
  { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x' at app.tsx:42" },
  { level: "success", timestamp: "12:00:09", message: "✓ compiled in 8.1s" },
  { level: "error", timestamp: "12:00:10", source: "[lint]", message: "2 problems (1 error, 1 warning)" },
];

const STREAM: LogLine[] = [
  { level: "info", timestamp: "12:00:01", message: "Allocating sandbox…" },
  { level: "success", timestamp: "12:00:01", message: "✓ microVM ready (180ms)" },
  { level: "info", timestamp: "12:00:02", message: "Restoring snapshot…" },
  { level: "success", timestamp: "12:00:03", message: "✓ snapshot restored (820ms)" },
  { level: "info", timestamp: "12:00:03", message: "Mounting ephemeral FS…" },
  { level: "success", timestamp: "12:00:04", message: "✓ FS mounted (620ms)" },
  { level: "info", timestamp: "12:00:04", message: "Booting Node 26…" },
  { level: "success", timestamp: "12:00:05", message: "✓ runtime up (1082ms)" },
  { level: "info", timestamp: "12:00:05", message: "Executing main.js…" },
  { level: "warn", timestamp: "12:00:06", message: "deprecation: fs.rmdir recursive" },
  { level: "success", timestamp: "12:00:07", message: "✓ exit 0 (240ms)" },
];

// 流式追加演示：运行逻辑留消费侧，组件只贴底渲染
function StreamDemo() {
  const [n, setN] = useState(2);
  useEffect(() => {
    if (n >= STREAM.length) return;
    const id = setTimeout(() => setN((c) => c + 1), 700);
    return () => clearTimeout(id);
  }, [n]);
  return <LogViewer lines={STREAM.slice(0, n)} showTimestamp height={220} />;
}

export const logViewerShowcase: ShowcaseSpec = {
  controls: [],
  examples: [
    {
      title: "基础用法",
      description: "lines 数据驱动渲染，level 字段按级别着色（info/warn/error/success/command）。",
      code: `<LogViewer
  lines={[
    { level: "command", message: "▸ npm run build" },
    { level: "info", message: "compiling 248 modules…" },
    { level: "success", message: "✓ compiled in 8.1s" },
    { level: "error", message: "2 problems (1 error, 1 warning)" },
  ]}
/>`,
      render: () => (
        <LogViewer
          height={160}
          lines={[
            { level: "command", message: "▸ npm run build" },
            { level: "info", message: "compiling 248 modules…" },
            { level: "success", message: "✓ compiled in 8.1s" },
            { level: "error", message: "2 problems (1 error, 1 warning)" },
          ]}
        />
      ),
    },
    {
      title: "时间戳 + 来源前缀",
      description: "showTimestamp 渲染行首时间戳；line.source 弱化渲染在正文前。",
      code: `<LogViewer
  showTimestamp
  lines={[
    { level: "command", timestamp: "12:00:01", message: "▸ npm run build" },
    { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x' at app.tsx:42" },
    { level: "success", timestamp: "12:00:09", message: "✓ compiled in 8.1s" },
  ]}
/>`,
      render: () => <LogViewer lines={STATIC} showTimestamp height={220} />,
    },
    {
      title: "流式追加（自动贴底）",
      description: "autoScroll 默认开启，新行追加即贴底；运行逻辑留消费侧，组件只渲染。",
      code: `<LogViewer lines={lines} showTimestamp height={220} />`,
      render: () => <StreamDemo />,
    },
    {
      title: "折行模式",
      description: "wrap 开启后长行折行而非横向滚动，窄容器里也能读全。",
      code: `<LogViewer
  wrap
  lines={[
    { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 …这是一条很长的日志" },
  ]}
/>`,
      render: () => (
        <LogViewer
          wrap
          height={140}
          lines={[
            { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect — 这是一条很长的日志，wrap 开启后会折行而不是横向滚动，保证窄容器里也能读全。" },
          ]}
        />
      ),
    },
  ],
  states: [
    { name: "构建日志（多级别 + 时间戳）", render: () => <LogViewer lines={STATIC} showTimestamp height={220} /> },
    { name: "流式追加（自动贴底）", render: () => <StreamDemo /> },
    { name: "折行模式", render: () => (
      <LogViewer
        wrap
        height={140}
        lines={[
          { level: "error", message: "Error: connect ECONNREFUSED 127.0.0.1:5432 at TCPConnectWrap.afterConnect — 这是一条很长的日志，wrap 开启后会折行而不是横向滚动，保证窄容器里也能读全。" },
        ]}
      />
    ) },
  ],
  renderWithProps: () => <LogViewer lines={STATIC} showTimestamp height={220} />,
  toCode: () => `<LogViewer
  lines={[{ level: "command", timestamp: "12:00:01", message: "▸ npm run build" }, …]}
  showTimestamp
/>`,
};
