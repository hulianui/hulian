---
"@hulianui/ui": patch
---

修复浮层件的缩放与位移入场从未真正动画过（#341）：过渡列表补上 `translate` / `scale` / `rotate`。

Tailwind v4 把 `scale-95` 编成独立的 `scale` 属性、`-translate-x-full` 编成独立的 `translate` 属性，而按 CSS Transforms Level 2，`transition-property: transform` **不覆盖**这三个独立变换属性。库里 21 个浮层件手写的 `transition: opacity …, transform …` 因此有一半是空转：Dialog / Modal / AlertDialog / Popover / Select / Menu / ContextMenu / Combobox / Cascader / Tooltip / HoverCard / Popconfirm / NavigationMenu 与四个日期时间件的缩放入场、Drawer 四向滑入、ActionSheet 底部滑入、Toast 的位移，一直是瞬间跳到终态，只有 opacity 在淡。因为淡入还在，观感上只是「弹窗是浮现的、不是弹出来的」，没人报障。

同时把 22 处手写过渡串收敛成 `overlayTransitions` 四个预设（popup / backdrop / slide / fade），并加一条源码守卫测试拦住新的手写串。遮罩现在只声明它真正会变的 `opacity`，不再跟着列一串空操作。

`@hulianui/ui/select` 的体积基线从 80KB 抬到 82KB：共享模块本身 684 字节（未压缩），落到 select 的 gzip 上约 0.1KB，把它顶过了原本贴着实测值的那条线。只动这一条，其余入口的基线保持原样。

配套：变换类时长乘 `--hl-motion-transform-factor`（`@hulianui/tokens` 新增），用户偏好减弱动效时该系数为 0，位移与缩放瞬时到位，淡入淡出保留。这条开关必须由库兜住 - 过渡写在内联 `style` 上，而内联样式压不过媒体查询，消费方自己写 `prefers-reduced-motion` 覆盖不掉。

<!-- changelog-en:start -->
Fix overlay scale and slide entrances that never actually animated (#341): the transition list now includes `translate`, `scale` and `rotate`.

Tailwind v4 compiles `scale-95` into the standalone `scale` property and `-translate-x-full` into the standalone `translate` property, and per CSS Transforms Level 2 a `transition-property: transform` does **not** cover those three. Half of every hand-written `transition: opacity …, transform …` in the library was therefore inert: the scale entrance of Dialog, Modal, AlertDialog, Popover, Select, Menu, ContextMenu, Combobox, Cascader, Tooltip, HoverCard, Popconfirm, NavigationMenu and the four date and time components, the four-sided Drawer slide, the ActionSheet bottom slide and the Toast offset all jumped straight to their final state, with only opacity fading. The fade masked it well enough that nobody filed a report; overlays simply appeared rather than popped.

The 22 hand-written transition strings are now consolidated into four `overlayTransitions` presets (popup, backdrop, slide, fade), guarded by a source-scanning test that rejects new hand-written strings. Backdrops now declare only the `opacity` they actually change instead of trailing a no-op transform segment.

The size baseline for `@hulianui/ui/select` moves from 80KB to 82KB. The shared module is 684 bytes uncompressed, roughly 0.1KB gzipped inside select, which was enough to cross a line that sat flush against the measured value. Only that entry moved; every other baseline stays as it was.

Supporting change: transform durations are multiplied by `--hl-motion-transform-factor` (new in `@hulianui/tokens`), which drops to 0 under a reduced-motion preference so movement and scaling settle instantly while fades remain. The library has to own that switch, because the transitions live in inline `style` and inline styles outrank media queries, leaving consumers no way to override them.
<!-- changelog-en:end -->
