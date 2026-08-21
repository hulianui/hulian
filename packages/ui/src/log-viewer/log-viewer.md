---
slug: log-viewer
name: LogViewer
category: data-display
group: collection
tags: []
exports: [LogViewer, levelClass]
status: enriched
---

# LogViewer

> 按级别着色展示日志行，新行自动贴底 · data-display/collection

## 何时用

渲染结构化日志行（构建/CI/运行时流式输出）：按 level 着色、可选时间戳、新行自动贴底。本组件是数据驱动的真日志列表；要纯装饰性终端外壳（打字机动画演示）用 Terminal mockup；要 AI 对话用 [Conversation](../conversation/conversation.md)。

## 导入
```ts
import { LogViewer, levelClass } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| lines* | `LogLine[]` | - | 日志行（数据驱动） |
| showTimestamp | `boolean` | `false` | 显示每行时间戳（渲染在行首） |
| autoScroll | `boolean` | `true` | 新行**黏底**跟随：只在用户本就停在底部时才滚。上滚看历史即暂停跟随，滚回底部自动恢复 |
| maxLines | `number` | - | 只渲染最后 N 行（0 / 不传 = 不截）。长流护栏，截断只发生在渲染层，`lines` 原数组不动 |
| wrap | `boolean` | `false` | 长行折行；false 时长行横向滚动 |
| height | `number \| string` | `320` | 滚动区高度 |
| className | `string` | - | 自定义类 |

`LogLine`：`{ level?: LogLevel; message: ReactNode; timestamp?: string; source?: string }`。
`LogLevel`：`"info"｜"warn"｜"error"｜"debug"｜"success"｜"command"`（默认 `info`；`command` 高亮被执行的命令/提示符行；`source` 如 `"[build]"` 弱化渲染在 message 前）。

## 示例
```tsx
<LogViewer
  lines={[
    { level: "command", timestamp: "12:00:01", message: "▸ npm run build" },
    { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x'" },
    { level: "error", timestamp: "12:00:10", source: "[lint]", message: "2 problems" },
    { level: "success", timestamp: "12:00:09", message: "✓ compiled in 8.1s" },
  ]}
  showTimestamp
  height={220}
/>
```

流式追加只需不断换新 `lines`，组件负责贴底：
```tsx
<LogViewer lines={STREAM.slice(0, n)} showTimestamp height={220} />
```

## 禁忌 / 坑

- 流式运行逻辑（计时/追加）留在消费侧，组件只负责按 `lines` 渲染并贴底——不要期待它自己产生日志。
- `autoScroll` 是**黏底**不是强制贴底：用户上滚看历史时不会被新行拽回去，滚回底部自动恢复跟随。判定「已在底部」留了 8px 容差（亚像素与惯性滚动会让 `scrollTop` 差零点几，卡死等号会永远判 false）。完全不要自动滚动才关掉它。
- 长流务必给 `maxLines`：一条跑几小时的构建流会把几万个 DOM 节点堆在页面里，滚动直接卡死。
- 不解析 ANSI 转义序列。带颜色码的原始输出请在消费侧先剥掉，或自己拆成 `LogLine` 的 `level`。
- `wrap=false`（默认）时超长行横向滚动而非折行；窄容器读全文须开 `wrap`。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
