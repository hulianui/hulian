---
slug: steps
name: Steps
category: navigation
group: inpage
tags: []
exports: [Steps]
status: enriched
---

# Steps

> 步骤条(原生) · 零依赖数据驱动 items + 水平/垂直 + wait/process/finish/error 状态派生 + 可点击受控(分步表单/审批流) · navigation/inpage

## 何时用

零依赖、数据驱动的步骤条，用于分步表单、订单流转、审批流的进度展示，支持水平/垂直、状态派生、可点击受控、描述/图标。与 [Stepper](../stepper/stepper.md) 的分工：Stepper 是轻量的进度指示，Steps 功能更全（状态派生、可点击受控、描述/图标），分步流程优先用 Steps。

## 导入
```ts
import { Steps } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `StepsItem[]` | — | 步骤数组，见下表。 |
| current | `number` | `0` | 当前步骤索引（从 0 起），用于派生各步状态。 |
| status | `"process" \| "finish" \| "error"` | `"process"` | 当前步（index===current）的状态。 |
| direction | `"horizontal" \| "vertical"` | `"horizontal"` | 排布方向。 |
| size | `"sm" \| "md"` | `"md"` | 尺寸。 |
| className | `string` | — | — |

**StepsItem**

| 字段 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 步骤标题。 |
| description | `ReactNode` | 标题下方次要文案。 |
| icon | `ReactNode` | 自定义指示器内容（覆盖默认序号/状态图标）。 |
| status | `"wait" \| "process" \| "finish" \| "error"` | 显式状态，覆盖由 current 派生的状态。 |
| disabled | `boolean` | 禁用：不可点击、降透明度。 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(index: number) => void` | 提供则每步可点击，点击非禁用步触发（index）。 |

## 示例
```tsx
const ORDER = [
  { title: "提交申请", description: "填写报销单据" },
  { title: "部门审批", description: "主管复核金额" },
  { title: "财务打款", description: "对公转账" },
  { title: "完成", description: "归档结案" },
];

// 静态进度
<Steps items={ORDER} current={1} />

// 可点击 + 受控
const [current, setCurrent] = useState(1);
<Steps items={ORDER} current={current} onChange={setCurrent} />
```

## 禁忌 / 坑

- 步状态默认由 `current` 派生：index < current → finish，== current → `status`（默认 process），> current → wait；要单独标某步可在该 `StepsItem.status` 显式覆盖。
- 传了 `onChange` 才可点击；点击禁用步（`disabled`）不触发回调。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
