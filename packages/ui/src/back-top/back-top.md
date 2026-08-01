---
slug: back-top
name: BackTop
category: navigation
group: inpage
tags: []
exports: [BackTop]
status: enriched
---

# BackTop

> 回顶 · 监听滚动容器超 visibilityHeight 淡入 + scrollTo smooth + prefers-reduced-motion 降级 auto(零依赖) · navigation/inpage

## 何时用

长页面滚动超过一定高度后，在右下角淡入一颗悬浮按钮，点击平滑回到顶部。只想要回顶单一动作时用它；需要把任意内容钉在视口某处用 [Affix](../affix/affix.md)；需要页内锚点跳转用 [Anchor](../anchor/anchor.md)。

## 导入
```ts
import { BackTop } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| target | `() => HTMLElement \| Window \| null` | `window` | 滚动监听 & 回顶的目标容器（返回容器元素或 window）。 |
| visibilityHeight | `number` | `400` | 滚动超过该高度(px)才淡入显示。 |
| className | `string` | — | 默认 `fixed` 贴视口右下；可覆盖为 `absolute` 收进局部容器。 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `() => void` | 点击回顶后的回调（在滚动触发之后）。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 自定义悬浮按钮内容。默认上箭头图标。 |

## 示例
```tsx
// 默认：监听 window，滚动超 400px 出现
<BackTop visibilityHeight={400} />

// 收进局部滚动框：target 指向该框，className 覆盖 fixed→absolute
const ref = useRef<HTMLDivElement>(null);
<div className="relative">
  <div ref={ref} className="h-44 overflow-y-auto">{/* …内容… */}</div>
  <BackTop target={() => ref.current} visibilityHeight={80} className="absolute bottom-3 right-3" />
</div>
```

## 禁忌 / 坑

- 默认 `fixed` 贴整页视口右下；放进局部滚动区时必须同时传 `target`（指向该容器）并用 `className` 覆盖为 `absolute`，否则按钮会飘到整页角落、且监听的是 window 滚动而非容器滚动。
- 已内置 `prefers-reduced-motion` 降级（smooth → auto），无需消费侧处理。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [Stepper](../stepper/stepper.md)
