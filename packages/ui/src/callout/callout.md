---
slug: callout
name: Callout
category: feedback
group: message
tags: []
exports: [Callout]
status: enriched
---

# Callout

> 文章 / 文档用提示框（admonition）。 · 反馈/提示

## 何时用

长文 / 文档内联强调「Tip / 坑 / 正解 / 警告」，只让标题+图标着 tone 色、正文保持 foreground 可读（左 accent 竖边 + 极浅 tone 底）。要整块染 tone 色的通知横幅用 Alert；Callout 专为正文阅读流里的克制提示。

## 导入
```ts
import { Callout } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"tip"｜"info"｜"warning"｜"success"｜"danger"` | `"tip"` | 语气：tip 主色（建议）、info 信息色（背景说明）、warning 警告、success 正解、danger 坑/危险。tip 与 info 在 0.8.0 前同色，现已分开 |
| className | `string` | - | 透传到根容器 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 图标 slot（emoji 或 SVG；设计系统不绑图标库） |
| title | `ReactNode` | 标题（tone 色强调） |
| children | `ReactNode` | 正文（foreground 可读） |

## 示例
```tsx
<Callout tone="warning" icon="⚠️" title="注意">
  这一步会改写已有数据，操作前先备份。
</Callout>

<Callout tone="danger" title="坑">
  裸 <code>var(--primary)</code> 喂给 SVG fill 不解析，须带 --color- 前缀。
</Callout>
```

## 禁忌 / 坑

- 纯皮肤组件，只消费语义 token（含 success/warning/danger）；改色请改主题 token，别在此打内联 style。
- `title`/`icon` 都不传时只渲染正文区（无标题行），适合纯一段提示。

## 相关
—
