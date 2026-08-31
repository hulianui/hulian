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
