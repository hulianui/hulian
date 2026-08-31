---
"@hulianui/ui": patch
---

`Brand` 的徽章支持动图 / 视频 mark：GIF、APNG、动图 WebP 直接当 `img` 传就会动；包一层 `<picture>` 给开了「减弱动效」的用户一张静态回退，以及静音循环的 `<video>`、自绘的 `<canvas>`，现在都按「铺满徽章 + `object-cover`」处理。此前尺寸规则只认直接子级的 `img`，动图一加 `<picture>` 回退就掉出规则、按原图尺寸被裁掉半截。顺带修掉一个被方形素材掩盖的旧缺陷：徽章是 grid 容器，替换元素作为 grid 项时 `height:100%` 不解析，非方形图片此前只按宽度等比缩放、并没有真的被 `object-cover` 裁成方形；现在媒体子元素改走 `absolute inset-0`，任何比例的素材都铺满。

`AdminLayout` 文档同步说明：品牌区直接放 `Brand`，动图 logo 的尺寸与减弱动效回退在 `Brand` 那边约定，`logo` 槽只负责摆位。

<!-- changelog-en:start -->
`Brand` badges now support animated and video marks. A GIF, APNG, or animated WebP passed as an `img` plays as-is; wrapping it in `<picture>` to give users with reduced motion enabled a static fallback, a muted looping `<video>`, and a self-drawn `<canvas>` all now fill the badge with `object-cover`. Previously the size rule only matched a direct-child `img`, so adding a `<picture>` fallback dropped the mark out of the rule and clipped it at its natural size. This also fixes an older defect hidden by square assets: the badge is a grid container, and `height:100%` on a replaced element used as a grid item does not resolve, so non-square images were only scaled by width and never actually cropped square by `object-cover`. Media children now use `absolute inset-0`, so assets of any ratio fill the badge.

The `AdminLayout` docs now say to place `Brand` directly in the brand area: sizing and the reduced-motion fallback for animated logos are `Brand`'s contract, and the `logo` slot only positions it.
<!-- changelog-en:end -->
