---
"@hulianui/ui": minor
---

`DialogContent` 新增 `draggable`：按住标题行即可把对话框挪开，看清底下被遮住的内容。`ModalForm` 同步透传。

把手是标题行（`title` 与 `extra` 所在那一行），行里的按钮照常点击、不起拖；可见 header 由消费方自己画时，给自家元素加 `data-drag-handle` 即接上。位移写在 popup 的内联 `left` / `top`，不碰 `translate` / `transform`：一来消费方用 className 改的初始位置照常生效，二来 `transform` 在 Popup 的过渡列表里，写它会让每一步位移都吃 200ms 缓动。整块不会被拖出视口；每次打开回到初始位置。

<!-- changelog-en:start -->
`DialogContent` gains `draggable`: hold the title row to move the dialog aside and see what it was covering. `ModalForm` passes it through.

The handle is the title row (where `title` and `extra` live); buttons in that row still click instead of dragging, and a consumer-drawn header hooks in by marking its own element with `data-drag-handle`. The offset is written to the popup's inline `left` / `top` rather than `translate` / `transform`: an initial position set through className keeps working, and `transform` sits in the popup's transition list, so writing it would put a 200ms easing on every step of the drag. The popup never leaves the viewport, and every open starts from the initial position.
<!-- changelog-en:end -->
