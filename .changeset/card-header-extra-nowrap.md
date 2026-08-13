---
"@hulianui/ui": patch
---

`CardHeader` / `PageHeader`：`extra` 不再因为标题或描述变长而掉到第二行

`CardHeader` 结构态的左列此前只有 `min-w-0`。CSS 收集 flex 行时看的是 item 的
**hypothetical main size**（Flexbox §9.3），`flex-basis: auto` + 无 width 时它取 **max-content**；
`min-w-0` 只放开「同一行里能收缩到多小」，**降不了 base size**。于是一条够长的 `description`
就能把 `extra` 整块挤到第二行——哪怕左列完全收缩得起，哪怕调用方已经写了 `truncate` /
`line-clamp`（那两个管的是溢出怎么显示，不影响 max-content）。

现象是同一份调用代码、同一个视口，**只因为数据长度不同排成两种版式**：消费方 12 张同形状的卡里
有 3 张（描述最长的那 3 条）把 12px 的箭头掉到了描述下面，孤零零占一行（#263）。

左列改成 `flex: 1 1 0`（`grow basis-0`）后，换行判据与内容长度脱钩。

两个组件的差别是**刻意**的，判据是「这个容器的宽度是不是等于视口宽度」：

- **`PageHeader`** 保留 `max-sm:basis-auto`。页头总是全宽，「视口窄」就等于「页头窄」，
  那句注释里写的「窄屏 extra 换行到下方」本来就是想要的行为——只是此前它是由内容长度触发的，
  现在还原成它的字面意思。
- **`CardHeader`** 没有这一档。卡片宽度由布局给（三列网格 515px、侧栏卡 280px），与视口无关：
  900px 的桌面窗口里可能坐着一张窄卡，375px 的手机上卡片反而是全宽的，视口断点两种情况都猜错。
  取舍与 Ant 的 `.ant-card-head-wrapper`、MUI 的 `CardHeader` 一致：`extra` 恒同行，长标题该截断
  就截断。**这也意味着窄卡片里 `extra` 会一直占位**，给标题写 `truncate` 是调用方的事。

不传任何槽的裸插槽分支逐字不变（那条分支根本不是 flex）。

新增 `card.browser.test.tsx`：判据是「同一个 header，只改 `description` 的字符数，`extra` 的
`top` 与 header 高度都不许变」。这条必须在真实浏览器里跑——jsdom 没有布局，
`getBoundingClientRect()` 恒为 0、flex 也不换行，这个 bug 在那里根本不会发生；类名断言同样拦不住，
因为 `min-w-0` 一直都在、看着也对，错的是它管不到换行。
