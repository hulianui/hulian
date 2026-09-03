---
"@hulianui/ui": patch
---

`DialogContent` 的 `draggable`：把对话框挪开之后，遮罩跟着让开（#346）。

`draggable`（0.61.0）此前只做完了一半 —— 对话框挪得动，但底下依然什么也看不清：遮罩还是默认的 `bg-black/40 backdrop-blur-sm`，40% 黑加 4px 模糊把整页糊成一片，拖动只是把一块看不清的东西换个地方放。库自己 showcase 里那句「对话框挪开后，底下的页面内容依然可见」在真实页面上并不成立。

根子不在浓度调没调对，而在两件事互相抵消：默认遮罩表达的语义是「别看后面」，而 `draggable` 存在的唯一理由就是「挪开看后面」。所以让开这件事由组件负责，不再要求每个消费方各自去 `backdropClassName` 里配一遍。

触发时机是**真的产生了位移**的那一刻 —— 不是按下，也不是开着就变：遮罩被标上 `data-dragged`，浓度降到 10%、模糊撤掉，松手后不撤回，关掉再打开恢复原样（和位置一样不跨开关保留）。没被拖过的可拖对话框层次感一点不变。

浓度落在 10% 而不是全透明：遮罩仍然吃掉整屏点击（模态就是这个语义），全透会让「看得见却点不到」变成没有任何提示的怪事。要保持原样就用 `backdropClassName` 覆盖同名变体：

```tsx
<DialogContent draggable backdropClassName="data-[dragged]:bg-black/40 data-[dragged]:backdrop-blur-sm" />
```

浮层共用的遮罩过渡（`overlayTransitions.backdrop`）随之多列一项 `background-color`，让浓度变化有 200ms 缓动而不是硬跳；刻意**不含** `backdrop-filter` —— 模糊半径是整屏逐帧重算，而它唯一会变的时刻恰好是拖拽刚开始那一帧，会跟拖动本身抢同一批帧。另外四个用这套过渡的浮层从不在开着的时候改底色，多列一项对它们零影响。

<!-- changelog-en:start -->
`DialogContent`'s `draggable`: the backdrop steps aside once the dialog has been moved (#346).

`draggable` (0.61.0) was only half finished. The dialog moved, but nothing underneath became readable: the backdrop was still the default `bg-black/40 backdrop-blur-sm`, 40% black plus a 4px blur smearing the whole page, so dragging only parked an unreadable page somewhere else. The library's own showcase line, "the page underneath stays visible once the dialog is moved aside", was not true on a real page.

The root cause is not a dimming value that needed tuning; it is two things cancelling each other out. The default backdrop says "do not look behind me", and the only reason `draggable` exists is to look behind it. So stepping aside is now the component's job, instead of asking every consumer to configure it through `backdropClassName` — which would also mean dimming from the moment it opens, taking the layering away from dialogs nobody ever drags.

The trigger is the moment a drag **actually displaces** the popup: not on press (clicking the title should change nothing) and not merely because the option is on. The backdrop gets a `data-dragged` marker, drops to 10% dimming with the blur removed, stays that way after the pointer is released, and returns to normal on the next open. The marker is written to the DOM rather than held in React state, because Base UI unmounts the backdrop on close: the next open gets a fresh element with no marker, which keeps this in step with the existing "the position does not survive a close" rule. State would need a separate reset point, since `DialogContent` itself does not unmount with the dialog.

Dimming lands at 10% rather than fully transparent: the backdrop still swallows every click, which is what modal means, and an invisible layer would turn "visible but unclickable" into an unexplained oddity. To keep the original backdrop, override the same variants:

```tsx
<DialogContent draggable backdropClassName="data-[dragged]:bg-black/40 data-[dragged]:backdrop-blur-sm" />
```

The shared overlay backdrop transition (`overlayTransitions.backdrop`) now also lists `background-color`, so the dimming eases over 200ms instead of snapping. It deliberately leaves out `backdrop-filter`: a blur radius is recomputed across the whole screen every frame, and the one moment it would change is the first frame of a drag, competing with the drag itself for those frames. The four other overlays using this transition never change their backdrop color while open, so the extra entry costs them nothing.
<!-- changelog-en:end -->
