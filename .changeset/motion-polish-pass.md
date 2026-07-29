---
"@hulianui/tokens": minor
"@hulianui/ui": minor
---

动效手感统一：曲线 SSOT 打通、浮层从触发器长出、按压反馈铺开

对照 Emil Kowalski 的动效判据（easing / duration / 物理性 / 可中断性 / 性能 / 内聚性）做的一轮系统性打磨。行为变更，无 API 破坏。

**曲线 SSOT 打通（覆盖面最大）**

- `@hulianui/tokens` 的 preset.css 新增 `@theme` 缓动块：把 Tailwind 内置的 `--ease-out` / `--ease-in-out` 覆盖为瑚琏曲线，并新增 `--ease-drawer`（iOS/Ionic 抽屉曲线）。
- 同时覆盖 `--default-transition-timing-function` —— 库内 90+ 个组件写的是裸 `transition-colors`，此前全部走 Tailwind 默认的 `cubic-bezier(0.4, 0, 0.2, 1)`，与 motion token 驱动的动效并存两套手感。现已统一。
- `motion/tokens.ts` 补 `motionEase.drawer` / `motionEaseCss.drawer`。

**浮层从触发器长出**

13 个 Base UI overlay（Tooltip / Popover / Select / Menu / ContextMenu / Combobox / Cascader / HoverCard / Popconfirm / TreeSelect / DateField / DateRangePicker / TimePicker）接上 `--transform-origin`，进出场不再从自身中心缩放。Dialog / AlertDialog / Modal 保持居中（它们不锚定触发器）。

**按压反馈**

- 新增导出 `pressableClass` —— `pressable`（motion 版）的纯 CSS 平替，零 motion 运行时。
- 铺到 Fab（主钮 + 子动作）、Toggle、Segmented、SocialButton、Choicebox（大卡用 0.99）；ActionSheet 走 active 底色（移动端全宽条目变色比缩放更贴原生）。

**其它**

- Drawer / ActionSheet 面板改用 drawer 曲线 + 300ms，遮罩淡入与面板滑动解耦（原先共用一套参数）。
- Command 命令面板去掉缩放进场、缩至 150ms 纯淡入 —— ⌘K 是键盘高频入口，位移进场会让每次唤起慢半拍。
- Tooltip 支持 `data-instant`：同组内已有 tooltip 打开时，相邻触发器瞬时显示（跳过延迟与动画）。
- 清零 `transition-all`（Fab / BentoGrid / VoiceRecord / InfiniteMenu / ShimmerButton 改指名属性）。
- VoiceRecord 波形条从动态 `height` 改为 `scaleY` —— 每 100ms 刷新、十余条同时动 height 会逐帧触发整行 flex 重排。
- Folder 的 `ease-in` 改 `ease-out`。

**文档**

文档站新增 `/theme/motion` —— `/theme` 下此前有色彩/圆角/阴影/间距等页，唯独动效缺席。新页含曲线手感对比（悬停即看）、时长阶梯、「该不该动」的频率判据，以及按压反馈与浮层原点的接法。
