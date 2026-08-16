---
"@hulianui/ui": minor
---

#283–#287 一轮清零：Select loading 不改值 · AnimatedThemeToggler 受控 · Table 原语补 cellWhitespace / 列宽 prop · AdminLayout 侧栏不再横滑

- **修复（#283）**：受控 `Select`（尤其 `multiple`）浮层开着时把 `loading` 置 `true`，会收到一次 `onValueChange([])`（单选是 `null`）把已选清空。根因是加载态卸掉全部选项后，Base UI Select 的 Positioner 把「已卸载」的选中项当成被移除，主动回调剔除后的值。`loading` 是展示态，现在加载期间这类内部回调被吞掉并 `cancel()`：受控不触发 `onValueChange`，非受控内部值也保留，加载结束后已选项照常显示。注意只覆盖 `loading` 括住的窗口——浮层开着时直接换掉 `items` 且新列表不含已选项，Base UI 仍会回调剔除后的值；远程搜索请让已选项留在 `items` 里，或改用 `searchable`（Combobox 皮肤没有这条剔除逻辑）。
- **新增（#284）**：`AnimatedThemeToggler` 加受控形态 `theme` + `onThemeChange(next)`。`ThemeProvider` 挂着 `forcedTheme` 时其 `toggle` 按文档「写偏好不改视觉」，非受控的本组件点了动画照播、主题却不切；主题真源不在瑚琏这边（外壳 + iframe 各挂一份 `forcedTheme` Provider）就传受控对，圆形揭示不变，只是「切到哪」由消费方落值。受控时不碰 `useTheme().toggle`、不进自持降级也不告警；`onThemeChange` 在非受控下同样触发。不传维持原行为。
- **新增（#285）**：组合原语 `TableRoot` 加 `cellWhitespace`（`"nowrap" | "normal" | "pre-wrap"`，经 context 下发），`TableCell` 加 `whitespace` 按格覆盖——与高层 `Table` 的 `cellWhitespace` / `meta.whitespace` 同名同义，类名表两边共用一份（`TABLE_WHITESPACE_CLASS`）。`TableHead` 维持恒 nowrap。此前「表级 nowrap」只能靠 `tableClassName="whitespace-nowrap"` 继承，且要换行的列拿不到按列反向。
- **新增（#286）**：`TableHead` / `TableCell` 加 `width` / `minWidth` / `maxWidth`（`number | string`，落 inline style，语义同高层 `Table` 的 `size` / `minSize` / `maxSize`）。列宽是数据（来自字段配置、用户可改）时此前只剩 `style={{ width }}` 一条路，而 `@hulianui/guard` 的 no-style-override 会拦下；`w-[${px}px]` 不编译、`<col>` 只在 fixed 下可靠且给不了 `maxWidth`。消费方明写的 `style` 仍透传且优先。
- **修复（#287）**：`AdminLayout` 侧栏菜单可被触控板左右横扫约 9px。真凶是侧栏容器 232px 而 `NavMenu` 自带 `w-60`（240px）——不是滚动条占位；现在侧栏里的 `NavMenu` 宽度交给容器（`w-full`）。同时 `ScrollArea` 把非声明方向的溢出锁死：`vertical` 视口 `overflow-x: hidden`、`horizontal` 视口 `overflow-y: hidden`（`both` 不锁）。Base UI 给视口的是两轴 `overflow: scroll` 且原生条隐藏，此前内容超宽 1px 也能被横扫、没有任何滚动条提示；放进 `vertical` 区域的内容要自己不超宽，超出的部分现在是被裁而不是可滚。
