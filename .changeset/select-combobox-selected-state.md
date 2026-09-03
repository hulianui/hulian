---
"@hulianui/ui": patch
---

`Select` / `Combobox` 的选项补上选中态样式（#344）。

打开的面板里此前看不出哪一项是当前值 —— 选项行本身没有任何背景或文字色，只在最右侧有一个 16px 的 ✓。`searchable` 皮肤（走 `Combobox`）下更明显：整个列表一行高亮都没有，选项一多就只能逐行扫那个 ✓。非 `searchable` 的 Select 打开瞬间观感稍好，但那只是 highlight 恰好落在选中项上顺带盖住了问题，键盘一移动、指针一划过别的行，选中项就同样失去全部标记。

色值直接对齐库内既有的列表选中态（`Tree` / `Listbox` / `Cascader` 都是 `bg-primary/12` + `text-primary`），这两个组件此前是唯二没跟上的。

选中与 highlight 叠加时另给一档更重的底色，并且**显式写成两个属性的链式选择器**：`[data-selected]` 与 `[data-highlighted]` 特异性相同，同时命中时谁生效取决于 Tailwind 的生成顺序而不是类串里的书写顺序；链式那条特异性 0,3,0，稳定压过两条单态的 0,2,0。于是键盘停在当前值上时，它既比普通 highlight 更重，又不丢「这是已选项」的主色。

<!-- changelog-en:start -->
`Select` and `Combobox` options gain a selected state (#344).

An open panel gave no indication of which row held the current value: the row itself carried no background or text color, only a 16px check mark on the far right. The `searchable` skin, which runs on `Combobox`, made it worse, since not a single row in the list was highlighted and a long list left you scanning for that check mark line by line. A non-searchable Select looked acceptable at the moment it opened, but only because the highlight happened to land on the selected row; one arrow key or a pointer passing over another row stripped the selection of every marker.

The colors match the list selection already used elsewhere in the library, where `Tree`, `Listbox` and `Cascader` all use `bg-primary/12` with `text-primary`. These two components were the only ones that had never followed.

Selection combined with highlight gets its own heavier step, written **explicitly as a chained two-attribute selector**. `[data-selected]` and `[data-highlighted]` carry equal specificity, so which one wins while both match depends on Tailwind's output order rather than the order in the class string; the chained rule scores 0,3,0 and reliably beats the two single-attribute rules at 0,2,0. Resting the keyboard on the current value therefore reads heavier than an ordinary highlight without losing the primary color that marks it as selected.
<!-- changelog-en:end -->
