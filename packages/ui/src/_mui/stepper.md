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

> 步骤条 · MUI 桥 + active/completed 走瑚琏 token · navigation/inpage · MUI 桥

## 何时用

基于 MUI 的极简横向步骤条，仅 `steps` + `activeStep` 受控展示当前进度。新代码优先用零依赖、功能更全（垂直/状态派生/可点击/描述/图标）的 [Steps](../steps/steps.md)；本组件保留作 MUI 桥过渡，需要 MUI 主题一致性时才用。

## 导入
```ts
import { Stepper } from "@hulianui/ui"
```

> ⚠️ **前置条件：本组件属 `_mui` 桥接族，必须置于 `MuiBridgeProvider` 之内。**
> 桥主题把 `theme.alpha` 重写成 `color-mix`，不挂 Provider 时 MUI 核心件（如日期族头部的
> IconButton）会对 `var(--color-*)` 调 `alpha()` 并直接抛 `Unsupported color` —— 真实浏览器同样触发，
> 不是只在测试里出现。整个应用挂一次即可（通常在根 layout）。
>
> ```tsx
> import { MuiBridgeProvider } from "@hulianui/ui"
>
> <MuiBridgeProvider>
>   <App />
> </MuiBridgeProvider>
> ```

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
- 它是 MUI 桥（取非 overlay 件），样式经 emotion theme 读瑚琏 token；功能远弱于 Steps，能用 Steps 就别用它。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
