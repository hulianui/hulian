---
slug: stepper
name: Stepper
category: navigation
group: inpage
tags: []
exports: [Stepper]
status: enriched
---

# Stepper

> 步骤条 · 零依赖 flex 布局 + 自绘完成对勾 + 连接线随进度点亮 + aria-current · navigation/inpage

## 何时用

零依赖的极简横向步骤条，仅 `steps` + `activeStep` 受控展示当前进度。需要垂直/可点击/描述/自定义图标等更全能力时用 [Steps](../steps/steps.md)；只要一条横向进度指示时用本组件更轻。

## 导入
```ts
import { Stepper } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| steps* | `StepItem[]` | — | 步骤数组，每项 `{ label: ReactNode }`。 |
| activeStep* | `number` | — | 受控当前步（0-based）。值 ≥ steps.length 表示全部完成。 |
| className | `string` | — | — |

## 示例
```tsx
const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }, { label: "完成" }];

<Stepper steps={steps} activeStep={1} />
```

## 禁忌 / 坑

- `activeStep` 是纯受控、0-based；index < activeStep 显示为已完成，== 为进行中。要表达「全部完成」传 `activeStep={steps.length}`。
- 功能面刻意保持最小（只有 `steps` + `activeStep`）；需要垂直方向、可点击跳步、步骤描述或自定义图标时改用 Steps。
- 状态钩子是 `aria-current="step"` 与 `data-state="completed|active|pending"`，不是 MUI 的 `.Mui-active` 类名。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
