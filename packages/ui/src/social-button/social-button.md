---
slug: social-button
name: SocialButton
category: forms
group: button
tags: []
exports: [SocialButton]
status: enriched
---

# SocialButton

> 第三方登录按钮 · 微信/支付宝/QQ/微博 + GitHub/Google/Apple/X 品牌 logo(内联 simple-icons·零依赖) + outline/solid 变体 + 纯 logo 方钮 + loading · 黑白系品牌 solid 随主题前景避暗色不可见 · forms/button

## 何时用

第三方账号登录/绑定入口（微信、支付宝、QQ、微博、GitHub、Google、Apple、X）。内置品牌 logo、默认文案与品牌色，无需自己接 simple-icons。普通操作按钮用 [Button](../button/button.md)；需要把多个登录方式编成一组用 [ButtonGroup](../button-group/button-group.md) 包裹。

## 导入
```ts
import { SocialButton } from "@hulianui/ui"
```

## Props

继承原生 `<button>` 属性（除 `children` 受控覆盖外）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| provider* | `"wechat" ｜ "alipay" ｜ "qq" ｜ "weibo" ｜ "github" ｜ "google" ｜ "apple" ｜ "x"` | — | 第三方平台，决定 logo、默认文案与品牌色 |
| variant | `"solid" ｜ "outline"` | `"outline"` | solid=品牌色填充（黑白品牌随主题前景）；outline=描边中性底 + 品牌色 logo（推荐） |
| shape | `"button" ｜ "icon"` | `"button"` | button=带文案；icon=纯 logo 方钮 |
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸 |
| loading | `boolean` | `false` | 提交中：logo 替换为转圈并禁用 |
| className | `string` | — | 透传根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 透传原生点击回调（发起第三方登录/绑定） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖默认文案（如「使用微信登录」→「微信」） |

## 示例
```tsx
<SocialButton provider="wechat" />
<SocialButton provider="github" variant="solid" />
```
```tsx
{/* 纯 logo 方钮 + 加载态 */}
<SocialButton provider="alipay" shape="icon" />
<SocialButton provider="github" loading />
```

## 禁忌 / 坑

暂无已知坑。`loading` 会自动禁用按钮，无需额外传 `disabled`。github/x/apple 黑白系品牌的 solid 态会跟随主题前景色，避免在暗色下不可见——不要硬写品牌黑覆盖。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md)
