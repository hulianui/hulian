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

> 第三方登录按钮 · 微信/支付宝/QQ/微博 + GitHub/Google/Apple/X/Discord/GitLab 品牌 logo(内联 simple-icons·零依赖) + 自定义品牌逃生口 + outline/solid 变体 + 纯 logo 方钮 + loading · 黑白系品牌 solid 随主题前景避暗色不可见 · forms/button

## 何时用

第三方账号登录/绑定入口（微信、支付宝、QQ、微博、GitHub、Google、Apple、X、Discord、GitLab）。内置品牌 logo、默认文案与品牌色，无需自己接 simple-icons。枚举之外的平台（自建 OIDC / Keycloak / Authentik / Okta / 企业 SSO，以及未内置的品牌）给 `provider` 传对象即可，见下方「自定义平台」。普通操作按钮用 [Button](../button/button.md)；需要把多个登录方式编成一组用 [ButtonGroup](../button-group/button-group.md) 包裹。

## 导入
```ts
import { SocialButton } from "@hulianui/ui"
```

## Props

继承原生 `<button>` 属性（除 `children` 受控覆盖外）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| provider* | `"wechat" ｜ "alipay" ｜ "qq" ｜ "weibo" ｜ "github" ｜ "google" ｜ "apple" ｜ "x" ｜ "discord" ｜ "gitlab" ｜ SocialBrand` | - | 第三方平台，决定 logo、默认文案与品牌色。传对象即接入枚举外的平台，字段见下表 |
| variant | `"solid" ｜ "outline"` | `"outline"` | solid=品牌色填充（黑白品牌随主题前景）；outline=描边中性底 + 品牌色 logo（推荐） |
| shape | `"button" ｜ "icon"` | `"button"` | button=带文案；icon=纯 logo 方钮 |
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸 |
| loading | `boolean` | `false` | 提交中：logo 替换为转圈并禁用 |
| className | `string` | - | 透传根节点类名 |

### SocialBrand（自定义平台）

`provider` 传对象时的字段。皮肤（尺寸/形态/loading/按压/焦点环）与内置品牌完全共用。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| icon* | `ReactNode` | - | 品牌 logo。内联 `<svg>` / `<img>` / 图标组件皆可，会被约束到当前 `size` 的图标尺寸 |
| label* | `string` | - | 品牌名。用于默认文案（「{label}登录」）与 `shape="icon"` 时的 `aria-label` |
| brandColor | `string` | - | 品牌主色。outline 时给 logo 着色、solid 时作按钮底色；**不传即黑白档**，与内置 GitHub/X/Apple 同处方 |

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
```tsx
{/* 自定义平台：必须提到模块作用域，组件是 memo 的 */}
const KEYCLOAK: SocialBrand = { label: "企业 SSO", icon: <LockIcon /> };

<SocialButton provider={KEYCLOAK} />
```

## 禁忌 / 坑

- **自定义品牌对象必须提到模块作用域**（或 `useMemo` 起来）。本组件是 `memo` 的，写成 `provider={{ ... }}` 内联对象字面量，每次渲染都是新引用，memo 当场失效。
- **别等着枚举补全**：simple-icons 已应法务要求下架 Microsoft / LinkedIn / Slack / 飞书等 logo，这些在库里**无法内置**；自建 IdP 更是穷举不完。碰到没有的平台直接走 `SocialBrand`，不要因为「一组 4 个里坏 2 个」而整组退回 `Button` 自己塞 SVG。
- `loading` 会自动禁用按钮，无需额外传 `disabled`。
- github/x/apple 黑白系品牌的 solid 态会跟随主题前景色，避免在暗色下不可见——不要硬写品牌黑覆盖。自定义品牌不传 `brandColor` 时同档。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md)
