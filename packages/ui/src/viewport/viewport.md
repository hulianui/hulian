---
slug: viewport
name: Viewport
category: layout
group: container
tags: []
exports: [Viewport]
status: enriched
---

# Viewport

> 响应式容器 · container-type 容器查询上下文 + web/平板/手机 预设宽度(可 width 覆盖) + 可选设备切换器(dogfood Segmented) · 内部组件用 @md/@5xl 等容器变体按【容器宽度】自适应而非页面视口(跨设备同套布局自动重排) · layout/container

## 何时用

要让同一套布局按「容器宽度」而非「页面视口」重排时用——内部子组件写 `@md:`/`@5xl:` 容器变体即可自适应，并能用内置设备切换器预览 web/平板/手机三态。它建立的是容器查询上下文 + 宽度边框；要锁宽高比用 [AspectRatio](../aspect-ratio/aspect-ratio.md)，要等比缩放固定设计稿用 [FitScreen](../fit-screen/fit-screen.md)。

## 导入
```ts
import { Viewport } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| device | `"web" \| "tablet" \| "phone"` | — | 设备预设宽度（受控）：web 满宽自适应 / tablet 768px / phone 390px。 |
| defaultDevice | `"web" \| "tablet" \| "phone"` | `"web"` | 非受控初始设备。 |
| controls | `boolean` | `false` | 顶部显示设备切换器（dogfood Segmented）。 |
| width | `number \| string` | — | 自定义宽度，覆盖 device 预设（数字=px 或任意 CSS 长度）。 |
| name | `string` | — | 具名容器，用于 `@md/name:` 具名容器查询；缺省匿名容器（用 `@md:`）。 |
| framed | `boolean` | `true` | tablet/phone 加设备感边框；web 恒细边框。 |
| height | `number \| string` | 随内容 | 固定容器高度（数字=px 或 CSS）。 |
| className | `string` | — | 根容器类名。 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onDeviceChange | `(device: "web" \| "tablet" \| "phone") => void` | 设备变化回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 容器内容，内部用 `@md:`/`@5xl:` 等容器变体按本容器宽度自适应。 |

## 示例
```tsx
// 设备切换器：点 web/平板/手机，看容器内布局重排
<Viewport controls defaultDevice="phone">
  {/* 内部用 @md/@5xl 等容器变体即按容器宽度自适应 */}
  <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3">…</div>
</Viewport>
```

```tsx
// 自定义宽度，不要设备边框
<Viewport width={600} framed={false}>
  <ResponsiveDemo />
</Viewport>
```

## 禁忌 / 坑

- **容器变体 ≠ 屏幕断点**：子组件要写 `@md:`/`@5xl:`（容器查询前缀），不是 Tailwind 默认的 `md:`/`5xl:`（页面视口断点）；写错了响应的是浏览器窗口而非本容器宽度。
- 多个并存且要区分时用 `name` 建具名容器并以 `@md/name:` 命中，避免嵌套容器误命中最近祖先。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
