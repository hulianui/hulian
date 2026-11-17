---
slug: window-frame
name: WindowFrame
category: mockups
group: window
tags: []
exports: [WindowFrame]
status: enriched
---

# WindowFrame

> 用三色点标题栏的应用窗口包住一块界面，做成产品截图 · mockups/window

## 何时用

产品预览、AI 对话窗、代码演示这类「一个应用窗口」的展示：三色点 + 标题 + 右侧操作槽，没有地址栏。要浏览器外壳（地址栏 / 标签页）用 [Safari](../safari/safari.md) / [Chrome](../chrome/chrome.md)；要逐行播放命令用 [Terminal](../terminal/terminal.md)。

## 导入
```ts
import { WindowFrame } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | `ReactNode` | - | 三色点右侧的标题槽：字符串按等宽小字渲染（像文件名 / 路由），也可放 Tag 等节点 |
| toolbar | `ReactNode` | - | 标题栏右端的操作槽 |

> 继承 `<div>` 原生属性（`className` 落在外框上，给宽高用）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 窗口内容；内容区不带内边距 |

## 示例
```tsx
<WindowFrame title="dashboard">
  <div className="h-[30rem] bg-bg">…</div>
</WindowFrame>

<WindowFrame title={<Tag tone="brand" size="sm">MCP</Tag>}>
  <div className="space-y-4 p-5">…对话…</div>
</WindowFrame>
```

## 禁忌 / 坑

- 内容区不带内边距：截图类内容要铺满，对话 / 表单类内容自己包一层 padding。
- 三色点是 macOS 固定色，不跟主题色走（设备拟物的约定，与 Safari 相同）。

## 相关
[Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
