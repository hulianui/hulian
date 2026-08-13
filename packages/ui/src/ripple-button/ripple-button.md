---
slug: ripple-button
name: RippleButton
category: forms
group: button
tags: [animated]
exports: [RippleButton]
status: enriched
---

# RippleButton

> 波纹按钮 · 点击落点扩散(Material) + reduced-motion · forms/button · #animated

## 何时用

需要 Material 风格「点击落点扩散波纹」反馈的按钮。普通操作用 [Button](../button/button.md)；只想要视觉特效（流光/彩虹/脉冲）而非点击涟漪时用 [ShimmerButton](../shimmer-button/shimmer-button.md) / [RainbowButton](../rainbow-button/rainbow-button.md) / [PulsatingButton](../pulsating-button/pulsating-button.md)。

## 导入
```ts
import { RippleButton } from "@hulianui/ui"
```

## Props

继承全部原生 `<button>` 属性（`disabled`/`type`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸档，与 Button 同刻度（32/40/48px 高） |
| variant | `"solid" ｜ "outline" ｜ "ghost" ｜ "soft"` | `"solid"` | 外观档，与 [Button](../button/button.md) 的同名档同色。**没有 `link`**：波纹要有盒子，见「禁忌 / 坑」 |
| tone | `"brand" ｜ "neutral" ｜ "success" ｜ "warning" ｜ "danger"` | `"brand"` | 语气色，与 Button 的同名档同色。**没有 `current`**：波纹默认色要从 tone 推导，继承色推不出来 |
| rippleColor | `string` | 按 `variant` × `tone` 推导 | 波纹颜色。实心档默认取该 tone 的前景色（深底上的浅波纹），其余档取该 tone 的本色。传值即覆盖 |
| duration | `string` | `"600ms"` | 单次波纹动画时长 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 透传原生点击回调（点击同时触发波纹扩散） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮内容（文案/图标） |
| render | `ReactElement` | 渲染为自定义元素（如 `<a>`/Next `<Link>`），样式与波纹层合并进该元素；文案仍取 children |

## 示例
```tsx
<RippleButton>点我看波纹</RippleButton>
```
```tsx
<RippleButton duration="900ms">点我看波纹</RippleButton>
```
```tsx
// 外观跟 Button 一样按 variant × tone 选，不必从外面注入 buttonVariants()
<RippleButton variant="outline">取消</RippleButton>
<RippleButton variant="ghost">稍后再说</RippleButton>
<RippleButton tone="danger">删除</RippleButton>
<RippleButton variant="outline" tone="danger">删除</RippleButton>
```
```tsx
// 长得像实心按钮、但需要是真链接（中键新开标签页 / 右键复制链接 / 爬虫可见）
<RippleButton render={<Link href="/docs" />}>看文档</RippleButton>
```

## 禁忌 / 坑

- **与 [Button](../button/button.md) 共享底座与配色档**：排布、`size` 三档（32/40/48px 高）、焦点环、禁用态视觉、`forwardRef` 来自同一份 `EFFECT_BUTTON_BASE_CLASS` + `BUTTON_SIZE_CLASS`；`variant` × `tone` 的色号与 Button 逐格对齐（#233）。**不共享的是圆角、阴影与颜色 hover**——圆角是特效件自己的，`shadow-sm` 四个特效件一个都没有，而颜色 hover 与本件底座冲突（下一条）。0.27.0 前四个特效件各写各的，这些全缺，`px-6 py-3` 按内容撑高，工具栏里一排按钮会参差（#126）。
- **没有颜色 hover，交互反馈由波纹负责。** 特效件的底座刻意不含 `transition-colors`（它们变的是背景动画不是颜色），挂 `hover:bg-*` 会是一次无过渡的跳变。所以 `variant="ghost"` 的静息态就是一段文字，鼠标悬停不变底——要「悬停就有反应」的次要操作请用 `Button variant="ghost"`，本件的反馈是点下去那一下。
- **`variant` 没有 `link`，`tone` 没有 `current`。** 前者是因为波纹要有盒子：`link` 去掉了高度与横向内边距，波纹落在 `h-auto px-0` 的文字上会裁成一条缝或整片糊住文字。后者是因为波纹默认色要从 tone 推导，而 `current` 的意思正是「别设色、跟随容器继承」——真要跟随容器请显式传 `rippleColor="currentColor"`。
- **`variant` 讲外观，`render` 讲语义，别读混。** 上一条说的「要链接样式请用 `Button variant="link"`」指的是**长相**（要不要按钮盒子）；如果你要的是「长得就是这颗实心按钮、但它得是个 `<a>`」——中键新开标签页、右键复制链接、爬虫能看见——那是 `render={<a href="…" />}`，波纹与配色一样不少（#256）。
- 波纹色默认按档推导：实心档用该 tone 的**前景色**（深底上的浅波纹），描边 / 幽灵 / 浅底档用该 tone 的**本色**。反过来（浅底上用前景色）会得到一圈几乎看不见的白，所以自定义 `rippleColor` 时注意底色。
- 波纹动画在 `prefers-reduced-motion: reduce` 下自动抑制，无需手动处理。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
