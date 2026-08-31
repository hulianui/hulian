---
"@hulianui/ui": minor
---

中后台家族视觉升级：把「层级」从线改成高度，并修掉数字跳位。**这是默认视觉变更，升级后界面当天就会不一样。**

改动集中在三处 —— 逐屏审计后，中后台真正「素」的就是这三处，其余（Table 表头、Descriptions 键值、NavMenu 分组标题、Skeleton、Empty）本来就已成立，刻意没动：

- **`Stat`**：升到 `border-hairline + shadow-sm`（库内既定判据：有阴影 → 亮色去 border 改 hairline、暗色留 hairline，同 `Card` 的 `elevated` 档）；数值 24px → 30px 并加 `tracking-tight`；label 加 `font-medium`；角标图标获得中性 `bg-muted` 底座；数值与趋势行加 `tabular-nums`。刻意**不加** hover 抬升 —— Stat 本身不可点，给了就是骗用户这儿能点。
- **`SearchForm`**：容器从纯 1px 平面对齐到 `border-hairline + shadow-sm`。此前同一个列表页里查询区是平的、下方 `ProTable` 容器带阴影，两块落在不同平面上，中间那道缝一眼可见。
- **`AdminLayout`**：顶栏从 `border-b border-border` 改为 `border-b border-hairline + shadow-sm`，用高度而不是硬线与内容区分层。侧栏保持 `border-r` 不动 —— 竖直投影会往内容区糊一片灰，那不是分层是脏。

外加两处等宽数字修复（可读性缺陷，不是审美偏好）：`ProTable` 的「共 N 条」与 `Pagination` 的页码。位数一变，比例字距会让整行左右抽动，`Pagination` 里还会带偏滑块动画的落点。

**迁移**：想保留旧的纯平面观感，对 `Stat` / `SearchForm` 传 `className="shadow-none border-border"` 即可。`Stat` 的数值大了一档且仍是 `truncate`，窄卡（< 200px）里长数值会更早被截断，请给足宽度或改用 `Statistic`。

<!-- changelog-en:start -->
Visual upgrade for the admin family: hierarchy moves from lines to elevation, and jittering numbers are fixed. **This changes the default look; interfaces will look different the day you upgrade.**

The changes concentrate on three places. After a screen-by-screen audit these were the only genuinely flat spots in the admin family; the rest (Table header, Descriptions key/value rows, NavMenu group titles, Skeleton, Empty) already held up and were deliberately left alone:

- **`Stat`**: raised to `border-hairline + shadow-sm` (the library's established rule: with a shadow, light mode drops the border for a hairline and dark mode keeps the hairline, matching `Card`'s `elevated` tier); value goes from 24px to 30px with `tracking-tight`; label gains `font-medium`; the corner icon gets a neutral `bg-muted` plinth; value and trend rows use `tabular-nums`. Deliberately **no** hover lift: a Stat is not clickable, and a lift would promise a click that does nothing.
- **`SearchForm`**: the container moves from a flat 1px border to `border-hairline + shadow-sm`. Until now the query area on a list page was flat while the `ProTable` container below it carried a shadow, so the two blocks sat on different planes with a visible seam between them.
- **`AdminLayout`**: the top bar changes from `border-b border-border` to `border-b border-hairline + shadow-sm`, separating from the content with elevation instead of a hard line. The sidebar keeps its `border-r`: a vertical shadow would smear grey into the content area, which reads as dirt, not depth.

Plus two tabular-number fixes (readability defects, not taste): the "N items total" count in `ProTable` and the page numbers in `Pagination`. When the digit count changes, proportional figures make the whole row shift sideways, and in `Pagination` the sliding indicator lands in the wrong place as well.

**Migration**: to keep the old flat look, pass `className="shadow-none border-border"` to `Stat` / `SearchForm`. The `Stat` value is one step larger and still `truncate`, so long values in narrow cards (< 200px) get cut off sooner; give them room or switch to `Statistic`.
<!-- changelog-en:end -->
