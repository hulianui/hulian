---
"@hulianui/ui": patch
---

修复 `MetaBalls` 的 `color` / `cursorBallColor` 完全不生效，以及 `Sortable` 拖拽时抓手光标持续闪烁。

`MetaBalls` 之前用 `/rgba?\(...\)/` 正则解析探针元素的计算色值，而本库的 `oklch()` token 经 Lightning CSS 降级后计算值是 `lab(...)` —— 正则永远不匹配，两个颜色 prop **全部**静默落到兜底中性灰，文档站上「自定义配色」那个示例和默认示例渲染出来是同一片灰白球。改成与库内其它 30 余个 WebGL 件一致的离屏 1×1 画布换算（浏览器负责所有色彩空间转换）。顺带两处硬化：探针挂到组件自己的子树里，`var()` 因此吃就近主题岛的值而不是 `:root` 的；写错的字面量与未定义的 `var(--typo)` 现在回兜底色，而不是静默继承祖先文字色把球画成黑的。颜色只活在 shader uniform 里，DOM 查不到，typecheck / guard / 单测全都看不见这个缺陷，补了真实浏览器测试守着。

`Sortable` 之前把抓握态写成 `active:cursor-grabbing`，即「光标取决于指针此刻压着谁」。拖拽期间指针底下的元素每帧都在换（被拖项的 transform 落后一帧、行间空隙归 `ul`、让位动画中的其他行、消费方行内的 `input`/`button`），`:active` 随之通断，浏览器每个输入事件重算一次光标，表现就是抓手图标持续闪烁。改为拖拽期间用与位置无关的常量：被拖行、其余行、`ul` 与 `document.body` 四处同时钉成 `grabbing`，结束或卸载还原；键盘拖拽不动 body 光标（没有按下的鼠标）。

同时给 `Sortable` 拖拽中的那一项加上 primary 语义色（主色描边 + 主色淡底 + 手柄主色），此前只有阴影和中性 ring，长列表里认不出被抓起的是哪一行。

<!-- changelog-en:start -->
Fixes `MetaBalls` ignoring `color` / `cursorBallColor` entirely, and the grab cursor flickering while dragging a `Sortable` item.

`MetaBalls` used to parse the probe element's computed color with an `/rgba?\(...\)/` regex. This library's `oklch()` tokens are downleveled by Lightning CSS, so the computed value is `lab(...)`: the regex never matched, and **both** color props silently fell back to the neutral grey default. On the docs site the "custom colors" example and the default example rendered the same grey-white blobs. Color resolution now goes through an offscreen 1x1 canvas, the same approach as the other 30-odd WebGL components in the library (the browser handles every color-space conversion). Two hardenings ride along: the probe is mounted inside the component's own subtree, so `var()` reads the nearest theme island instead of `:root`; and a mistyped literal or an undefined `var(--typo)` now falls back to the default color instead of silently inheriting the ancestor text color and painting the blobs black. The color lives only in a shader uniform and is invisible to the DOM, so typecheck, guard and unit tests could not see this defect; real-browser tests now cover it.

`Sortable` expressed the grab state as `active:cursor-grabbing`, meaning "the cursor depends on whatever the pointer is over right now". During a drag the element under the pointer changes every frame (the dragged item's transform lags one frame, the gaps between rows belong to the `ul`, other rows are mid-shift animation, consumer rows contain `input` / `button`), so `:active` toggled on and off and the browser recomputed the cursor on every input event: the grab icon flickered continuously. The drag now uses position-independent constants: the dragged row, every other row, the `ul` and `document.body` are all pinned to `grabbing` for the duration of the drag and restored on end or unmount. Keyboard drags do not touch the body cursor (no mouse button is held).

The item being dragged in `Sortable` also gets the primary semantic color (primary outline, tinted primary background, primary handle). Previously it only had a shadow and a neutral ring, which made the lifted row hard to spot in a long list.
<!-- changelog-en:end -->
