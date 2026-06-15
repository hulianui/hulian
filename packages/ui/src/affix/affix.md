---
slug: affix
name: Affix
category: navigation
group: inpage
tags: []
exports: [Affix]
status: enriched
---

# Affix

> 固钉 · 自研零依赖滚动吸附 + offsetTop/offsetBottom + 占位防跳动 + 自定义容器 · navigation/inpage

## 何时用

滚动越过阈值后让某块内容（操作栏、目录、表单提交条）切到 `position:fixed` 吸附停留，原位用等高占位元素撑住防布局跳动。需要在页内「跳转」到锚点用 [Anchor](../anchor/anchor.md)；只想要一颗回到顶部的按钮用 [BackTop](../back-top/back-top.md)；Affix 是把任意 children 钉在视口某位置。

## 导入
```ts
import { Affix } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| offsetTop | `number` | `0` | 距容器顶部多少 px 时吸顶固定。 |
| offsetBottom | `number` | — | 距容器底部多少 px 时吸底固定。仅在未给 offsetTop 时生效（同时给则 offsetTop 优先）。 |
| target | `HTMLElement \| Window \| null \| (() => HTMLElement \| Window \| null)` | `window` | 滚动监听容器，可传元素 / Window / getter。 |
| affixedClassName | `string` | — | 吸附时附加到固定元素的类名（如阴影 `shadow-lg`）。 |

> 另继承 `HTMLAttributes<HTMLDivElement>`（除 `children` / `onChange`）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(affixed: boolean) => void` | 吸附态变化回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 被固定的内容。 |

## 示例
```tsx
const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="h-64 overflow-auto">
  <Affix target={() => ref.current} offsetTop={8} affixedClassName="shadow-lg">
    <div className="rounded bg-primary px-4 py-2 text-bg">操作栏</div>
  </Affix>
  {/* …长内容… */}
</div>
```

## 禁忌 / 坑

- 当真正滚动的不是 window 而是某个中间层滚动容器（如 `<main class="overflow-y-auto">`）时，必须把容器经 `target` 传入；自研实现用 capture 阶段监听 window 滚动来兜住中间层，否则吸附条会停在过期视口坐标飘出容器。详见 [[affix-fixed-must-capture-scroll-for-intermediate-container]]。
- 文档/预览这类 window 不滚动的场景，务必用 `target` 指向真实滚动框，否则永远不吸附。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [BackTop](../back-top/back-top.md) · [Stepper](../_mui/stepper.md)
