---
slug: terminal
name: Terminal
category: mockups
group: window
tags: [animated]
exports: [Terminal]
status: enriched
---

# Terminal

> 终端框 · mac 窗口外壳 + 命令行逐行揭示(motion + tone) + 语法着色(命令名/flag/URL/数字) · mockups/window · #animated

## 何时用

展示安装命令、CLI 输出、构建日志等终端片段，逐行动画揭示并按 tone 着色（命令/输出/成功），常用于落地页「快速开始」「安装」段落。这是只读的视觉演示框，不是可交互终端（要真终端能力另寻 xterm 类方案）；要包网页截图用 [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md)。

## 导入
```ts
import { Terminal } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| lines* | `TerminalLine[]` | - | 要逐行揭示的行数组（见下表）。 |
| lineDelay | `number` | - | 相邻行揭示间隔(s)。 |
| title | `string` | - | 标题栏文字。 |
| highlight | `boolean` | `true` | 命令行/输出行语法着色（命令名/--flag/URL/数字/引号串走 --code-* token）；仅对 text 为字符串的 command/muted 行生效，success 等整行 tone 色不拆。 |
| className | `string` | - | 透传到根容器。 |

`TerminalLine`：
| 字段 | 类型 | 说明 |
|------|------|------|
| text* | `ReactNode` | 行文本。 |
| prompt | `string` | 行首提示符（如 `"$"`、`">"`），缺省无。 |
| tone | `"command" \| "muted" \| "success"` | 该行语气：command(前景) / muted(次要输出) / success。 |

## 示例
```tsx
<Terminal
  lines={[
    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
    { text: "✓ 安装完成", tone: "success" },
    { prompt: "$", text: "pnpm dev", tone: "command" },
    { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
  ]}
/>
```

## 禁忌 / 坑

- 语法着色只对 `text` 为字符串且 tone 为 command/muted 的行拆词；传 ReactNode 或 success 行整行用 tone 色，不再二次着色。
- 逐行揭示是 motion 客户端动画，宿主文件需是 `"use client"`（组件本身已声明）。

## 相关
[Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
