---
slug: funnel
name: Funnel
category: data-display
group: collection
tags: []
exports: [Funnel, computeFunnel]
status: enriched
---

# Funnel

> 按各阶段数量画漏斗，并标出级间转化率 · data-display/collection

## 何时用

可视化「单一线性流程逐级流失/转化」时用——访问→注册→付费、任务涌入→完成、留存衰减。要表达跨多层的有向分流（一节点流向多去向）用 Sankey；只列扁平数值用 [Table]。Funnel 专门表达「每级相对上一级的转化率」。

## 导入
```ts
import { Funnel, computeFunnel } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| stages* | `FunnelStage[]` | - | 阶段数组。`{id, label, value, tone?}`；漏斗宽/高按 value 比例缩放 |
| orientation | `"vertical" \| "horizontal"` | `"vertical"` | vertical 每级一行按宽度比 / horizontal 每列按高度比 |
| showConversion | `boolean` | `true` | 是否显示级间转化率徽标 |
| ariaLabel | `string` | `"漏斗图"` | 图表无障碍名称；非中文界面应显式传入本地化文案 |
| conversionLabel | `string` | `"转化"` | 转化率徽标前缀；非中文界面应显式传入本地化文案 |
| className | `string` | - | 外层类名 |

FunnelStage.tone：`"neutral" \| "brand" \| "success" \| "warning" \| "danger"`，缺省 `brand`（同 Tag 的 tone 语义，吃 token）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onStageClick | `(stage) => void` | 点击某一级回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderStage | `(stage, ctx: FunnelRenderCtx) => ReactNode` | 渲染函数：自定义阶段内容（替换默认 label + value）。ctx 含 `widthRatio`/`conversion`(首级 null)/`index` |

## 示例
```tsx
<Funnel
  stages={[
    { id: "in", label: "涌入", value: 1240, tone: "brand" },
    { id: "route", label: "路由", value: 1080, tone: "brand" },
    { id: "exec", label: "执行", value: 860, tone: "warning" },
    { id: "done", label: "完成", value: 720, tone: "success" },
  ]}
  orientation="vertical"
  showConversion
  onStageClick={(s) => console.log(s.id)}
/>
```

## 禁忌 / 坑

- tone 是固定语义枚举（neutral/brand/success/warning/danger），不接受任意 CSS 颜色——要自定义配色走 `renderStage`。
- `computeFunnel` 纯函数对首级 `conversion` 返回 `null`（无上一级可比），且不除零；自定义渲染时务必判 `conversion == null`。
- `Funnel` 不声明客户端边界，可在服务端组件中使用，也可接收服务端兼容的 `renderStage` 函数。需要其他语言时显式传 `ariaLabel` 与 `conversionLabel`。

## 相关

[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
