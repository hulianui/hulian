---
"@hulianui/ui": minor
---

下游 dogfood 缺口回流：可访问性 / 集成契约 / 表格·表单能力补齐

本轮全部条目来自两个真实消费方在实现页面时记录的缺口清单（`5069tk-app/docs/HULIAN-GAPS.md`
与 `hulian-admin` 的 `gap-matrix.md`），不是凭空设计的 API。0.10.0 已闭合的那批不再重复。

**修的是缺陷（会产出功能性问题，不只是不方便）**

- **`Link` 补 `render` 口子，消除死锚点。** `Link` 是纯皮肤 `<a>`，`LinkProps` 里没有 `render`，
  于是 `<Link render={<NextLink href="…" />}>` 把 `render` 当未知 DOM 属性交给 `<a>`（React 静默丢弃），
  **`href` 从头到尾没传下去**。产出的是一个看起来像链接、点了没反应、也没有 `link` role 的 `<a>` ——
  视觉与 hover 全对，只有点击和 `getByRole("link")` 会露馅，读屏用户完全拿不到它。
  现照 `Button` 的同款 `cloneElement` 范式合并皮肤与 props，`external` 的 `target`/`rel` 与外链图标一并生效。

- **`Table` 不开 `rowDraggable` 时不再执行任何 dnd-kit hook。** `useSensors` 原先写在组件顶层
  （hook 不可条件调用），任何用了 `Table` 的下游都会被迫拉起整条 dnd-kit 运行时。下游 vitest 里
  `@dnd-kit/*` 没有 `exports` 字段、只有 legacy main/module，解析出第二份 React 后整页崩，
  而栈顶落在 dnd-kit 内部、几乎无法归因到「表格没开拖拽」。现把 sensors 收进只在 `dragEnabled`
  时挂载的 `RowDndProvider`（`useSortable` 本就只在 `DraggableRow` 里），并加了一条盯住
  「hook 有没有被调用」本身的回归测试。

- **`AnimatedThemeToggler` 缺 `ThemeProvider` 不再 throw。** 原先直接抛 = 整页白屏，一个装饰性
  开关不该有这种杀伤力。现降级为自持主题态：直接读写 `<html data-theme>` 与同一个 localStorage
  键，dev 下打一条指明「少挂了 ThemeProvider」的告警。新增导出 `useThemeOptional`（缺上下文返回
  `null`）与 `THEME_STORAGE_KEY`；`useTheme` 的强约束语义不变，应用代码想要「缺 Provider 就报错」
  继续用它。

- **`Radio` 支持无障碍名。** `RadioProps` 此前只有 `value/disabled/label/id/className`，
  不给 `label`（图标卡片、自定义排版）时读屏只报「单选按钮」，拿不到这是哪个选项 —— 是真实的
  a11y 缺陷，不只是测试不好写。现透传 `aria-label` / `aria-labelledby` / `aria-describedby` 到 Root。

- **`Input` 转发 `ref` 到内层原生 `<input>`**（不是外壳 span）。`focus()` / `select()` / 取 `.value` /
  react-hook-form 的 `register()` 都指望拿到原生控件；此前不转发，消费方只能「受控值 + 包一层容器查 DOM」绕。

- **`Tree` 三条行为缺陷**：
  - `disabled` 改为**只挡选中/勾选，不挡展开** —— 此前禁用父节点连箭头都点不动，整棵子树彻底不可达。
  - 新增 `expandTrigger?: "row" | "icon"`（默认 `"row"`，行为不变）。默认下有子节点的行点了只展开、
    **永远选不中**；要选目录/部门/任意层级分类改 `"icon"`：只有箭头管展开，行归 select/check。
    「只能选叶子」是这个默认值的副作用，**不是契约**。
  - `TreeNode` 新增 `searchText?: string`。`label` 是 `ReactNode` 时，内置搜索与键盘首字母跳转
    此前会退化成拿 `key` 去匹配 —— 用户按看得见的文字搜一条都搜不出来。搜索与 typeahead 现共用
    同一条取值口径（新导出纯函数 `nodeSearchText`）。
  - 顺带：搜索平铺态下点父节点此前是切一个当下被忽略的 expanded 位（即毫无反应），现改为 select，
    并补上选中高亮与 `aria-selected`。

**能力补齐**

- **`Pagination` 接总条数口径**：新增 `totalItems` + `pageSize`。原有的 `total` 是**总页数**，
  与几乎所有后端回的 `total`（总条数）语义相反，此前每个消费方都在调用处补一次 `Math.ceil`，
  边界（0 条 / 整除）上最容易各算各的。两者同传以 `total` 为准并在 dev 下告警；
  `total` 的语义修正留到 1.0 主版本一次性做。同时补 `showTotal`（默认「共 N 条」，可传函数拿到
  条目区间）与 `showQuickJumper`（回车/失焦提交，自动夹紧）。

- **`Table` 新增 `onRowDoubleClick`**，对上后台列表「双击进编辑」的老习惯。与 `onRowClick` 相互
  独立可同传，行内交互元素复用同一条冒泡隔离。

- **`Transfer` 新增 `listHeight`（默认 240）与 `showSelectAll`。** 面板列表区高度此前是硬编码的
  `max-h-60`，几百节点的权限/部门数据下被挤成一条缝，只能在外面改样式绕。全选**只作用于当前
  过滤结果里的可用项** —— 搜出 3 条时点全选不会把看不见的另外 200 条也勾上。
  （配套给 `Listbox` 加了 `style`，用于表达 Tailwind 类给不出的动态值。）

- **`LogViewer` 面向流式日志**：`autoScroll` 从「每次渲染无条件贴底」改为**黏底** —— 只在用户
  本就停在底部时跟随，上滚看历史不再被新行拽回去，滚回底部自动恢复（判定留 8px 容差，
  亚像素与惯性滚动会让 `scrollTop` 差零点几）。新增 `maxLines`：一条跑几小时的构建流会把几万个
  DOM 节点堆在页面里，滚动直接卡死。

- **`Switch` 新增 `size`（sm/md/lg）与 `touchTarget`。** 此前只有一档 24px 高的轨道且无尺寸开关，
  低于移动端触控目标推荐值，消费方只能自己在外面包一层 ≥44px 的可点区。`touchTarget` 扩出的是
  不可见命中区，不占布局不改视觉；默认关，因为它会上下各溢出约 10px，桌面端密排表单里可能压到邻居。
  `md` 档与加这个 prop 之前逐像素一致。

- **`Alert` 新增 `tone="brand"`**，与 Tag / Button / Badge 对齐同一套 tone 取值。`info` 保留为
  历史别名（同配方、不会移除），新代码用 `brand`。

- **`Collapsible` 的 Trigger 加 `min-h-11`（44px）。** 它常配单行短文案，仅靠 `py-2.5` 只有 40px。

**集成契约显式化（此前一字未写，每个下游各查一遍）**

- 新增 **`@hulianui/ui/vitest-preset`** 导出：`withHulian(config)` 一行合并消费方 Vitest/Vite
  所需的解析配置，另导出 `hulianDedupe` / `hulianConditions` / `hulianMainFields` / `hulianInlineDeps`
  四个常量供自拼。瑚琏是源码分发，消费方的解析器要负责找瑚琏的第三方依赖，而这些依赖恰好横跨
  四种模块形态（自研零依赖件 / 纯 ESM peer / 有 exports 但 `import` 指向 `.cjs.mjs` 壳 / 无 exports
  只有 legacy main-module），各需一条不同配置。踩中时的症状是 `useRef`/`useId`/`useContext`/`useMemo`
  读到 null，**且栈顶落在第三方包内部**，每次都像是「那个组件坏了」。

- 新增 **`docs/consuming.md`** 并从 README 置顶引用，写明上面这条与「`_mui` 桥接族必须置于
  `MuiBridgeProvider` 之内」。后者不挂的后果是硬故障：桥主题把 `theme.alpha` 重写成 `color-mix`，
  MUI 核心件会对 `var(--color-*)` 调 `alpha()` 直接抛 `Unsupported color`，**真实浏览器同样触发**。
  六份 `_mui` 组件文档（Rating / Stepper / Calendar / DatePicker / DateTimePicker / TimeField）
  顶部均已补上这条前置条件 —— 此前 showcase 套了 Provider、文档只字未提，照文档抄必踩。

**行为变化提示（均为修正，非新增开关）**：`Tree` 的 disabled 节点现可展开；`Tree` 搜索态点父节点
现会 select；`LogViewer` 的 `autoScroll` 现是黏底而非强制贴底；`Collapsible` Trigger 最小高度
40px→44px。其余全部为可选新 prop，不传时与本版之前逐字一致。
