---
"@hulianui/tokens": minor
---

新增 `--hl-motion-transform-factor`：位移 / 缩放类过渡的时长系数，正常 1，`prefers-reduced-motion: reduce` 下 0。

配合 `@hulianui/ui` 的浮层过渡修复（#341）使用：变换类时长写成 `calc(时长 * var(--hl-motion-transform-factor, 1))`，于是减弱动效偏好下位移与缩放瞬时到位，而淡入淡出照旧 - 不产生位移的透明度变化不在减弱动效要规避的范围内，抹掉反而让人找不到焦点去了哪里。

做成变量而不是媒体查询里的 `!important`，是因为浮层过渡写在内联 `style` 上（Base UI 在过渡生命周期会往同一个 style 注入 `transition` 简写，长写会被 React 判成 shorthand / longhand 混用并整条丢弃），而内联样式压不过媒体查询。变量带回退值 `1`，没引这层 CSS 的项目行为不变。

<!-- changelog-en:start -->
Add `--hl-motion-transform-factor`, a duration multiplier for movement and scaling transitions: 1 normally, 0 under `prefers-reduced-motion: reduce`.

It pairs with the overlay transition fix in `@hulianui/ui` (#341). Transform durations are written as `calc(duration * var(--hl-motion-transform-factor, 1))`, so a reduced-motion preference settles movement and scaling instantly while fades continue. An opacity change that moves nothing is not what reduced motion sets out to avoid, and removing it would leave people unsure where focus went.

It is a variable rather than an `!important` rule inside a media query because overlay transitions live in inline `style` (Base UI injects a `transition` shorthand into that same style during the transition lifecycle, and a longhand there would be dropped by React as shorthand and longhand mixing), and inline styles outrank media queries. The fallback value of 1 keeps behaviour unchanged for projects that do not load this layer.
<!-- changelog-en:end -->
