---
"@hulianui/ui": patch
---

fix(dialog): DialogContent 封顶 85dvh 并让正文内部滚动

此前 Popup 没有任何高度约束与 overflow 处理，内容一长就顶穿视口：正文向上下溢出屏幕，
footer 被推到可视区外，「确定 / 保存」按钮点不到，且没有任何滚动条可用。表单类弹窗
（多凭据字段 + 说明 Alert）必然触发。

改为与 DrawerContent 同一套三段式（该组件早已是此写法，两者此前行为不一致）：

- Popup: `flex max-h-[85dvh] flex-col`
- Title / Description: `shrink-0`
- 正文: `min-h-0 flex-1 overflow-y-auto`（`min-h-0` 必需，否则 flex item 的
  `min-height:auto` 会让正文撑开父级、overflow 永不生效）
- Footer: `shrink-0`

短内容不受影响：未达 max-h 时弹窗仍按内容高度自适应，不出滚动条。
ModalForm / DrawerForm 复用 Dialog 引擎，一并受益。
