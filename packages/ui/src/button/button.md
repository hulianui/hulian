---
slug: button
name: Button
category: forms
group: button
tags: []
exports: [Button, buttonVariants]
status: enriched
---

# Button

> 按钮 · CVA 变体 + press 动效 · forms/button

## 何时用

最常用的操作按钮，含 solid/outline/ghost/link 变体、brand/danger 色调、loading 态与 press 缩放动效。需要特效吸睛 CTA 用 [ShimmerButton](../shimmer-button/shimmer-button.md)/[RainbowButton](../rainbow-button/rainbow-button.md)/[PulsatingButton](../pulsating-button/pulsating-button.md)；多按钮成组用 [ButtonGroup](../button-group/button-group.md)；只要按钮样式不要 `<button>` 语义用 `buttonVariants(...)` 拿 className。

## 导入
```ts
import { Button, buttonVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"solid" ｜ "outline" ｜ "ghost" ｜ "link"` | `"solid"` | 视觉变体 |
| tone | `"brand" ｜ "danger"` | `"brand"` | 语义色调 |
| size | `"sm" ｜ "md" ｜ "lg" ｜ "icon" ｜ "iconSm"` | `"md"` | 尺寸；icon/iconSm 为正方形图标按钮 |
| loading | `boolean` | `false` | 加载态，显示 spinner 并自动禁用 |
| render | `ReactElement` | — | 渲染为自定义元素（如 `<a>`/Next `<Link>`），用于按钮样式的链接 CTA；样式与 `aria-disabled` 合并进该元素 |
| children | `ReactNode` | — | 按钮文案 |
| ...ButtonHTMLAttributes | `ButtonHTMLAttributes<HTMLButtonElement>` | — | 透传原生属性（onClick、disabled、type 等） |

## 示例
```tsx
<Button>默认</Button>
<Button variant="outline">描边</Button>
<Button tone="danger">危险</Button>
<Button loading>加载中</Button>
```

## 禁忌 / 坑

- `render` 模式为降低风险**不套 motion**，故无 press 缩放动效（颜色/hover 过渡仍在）；文案优先取 Button 的 children。
- `loading` 会自动禁用按钮，无需再手动加 `disabled`。
- 自定义往按钮里塞图标+文字（尤其在特效按钮里）若图标掉到下一行，是 Tailwind Preflight 把 `svg{display:block}` 撑成块级所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——容器要 `inline-flex`，本 Button 已处理，自搓 wrapper 时注意。

## 相关
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
