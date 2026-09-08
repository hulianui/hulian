---
"@hulianui/ui": minor
---

fix(tree-select): 浮层此前只钉了宽度下限（`min-w-[var(--anchor-width)]`），没有上限，于是宽度是 shrink-to-fit——等于**整棵树里最长的那个 label**。三件事叠在一起：行上的 `truncate` 在容器无上限时根本不限制固有宽度；折叠着的子树仍在 DOM 里（高度被压成 0，`overflow:hidden` 的容器 max-content 仍由内容决定）；浮层没有 `max-w`。结果是一个从没被展开过的长节点名就能把浮层撑得比视口还宽，被 Positioner 推到贴左边缘，与触发器完全对不上（消费方实测：203 字的节点名 → 1536px 浮层，视口 1280px）。现在上限钉在 `min(32rem, var(--available-width))`：只钉「不超出视口」还不够，288px 的触发器配那个节点名仍有 1270px、照样盖住半个页面，32rem 让浮层留在触发器的量级上；宽字段不会被压窄，CSS 里 min-width 恒赢过 max-width。同一份浮层配方还在 `Select` 与 `Combobox` 上（同样只有下限、项上同样有 `truncate`），一并钉上。另新增 `TreeSelect` 的 `popupClassName`（此前 `className` 只落触发器，浮层连临时兜一下的余地都没有）与 `virtual` 透传（内部 Tree 早有虚拟滚动，从 TreeSelect 没有入口——上万节点的教材目录在收拢式选择器里比在常驻树里更常见）(#359)
