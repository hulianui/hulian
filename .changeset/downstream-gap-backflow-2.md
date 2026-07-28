---
"@hulianui/ui": minor
---

下游缺口回流（二）：日期时间族补齐 + 图标选择器 + 路由页签条 + Tree 虚拟滚动与拖拽

承接 0.11.0，把两份下游缺口清单（`5069tk-app/docs/HULIAN-GAPS.md`、`hulian-admin` 的
`gap-matrix.md`）里剩下的**能力型**条目一次清完。0.11.0 处理的是缺陷与集成契约，这一版是补能力。

**新增组件（4 件）**

- **`DateField`** —— 零依赖单日期选择器（forms/datetime）。此前库里只有 `_mui` 那份 MUI X 桥的
  `DatePicker`，想选一个日期就得把整条 MUI + emotion 拖进来、还得记得挂 `MuiBridgeProvider`。
  本件走 Base UI Popover + dayjs，与 `DateRangePicker` 同源（共用新抽出的 `lib/date` 里的
  `monthMatrix` / `WEEKDAY_LABELS`）。
  - `picker: "date" | "month" | "year"` 三粒度，值形状随之为 `YYYY-MM-DD` / `YYYY-MM` / `YYYY`
    —— 一并补掉 gap-matrix a9 说的「`year` 类型完全缺失」
  - 面板标题可点，逐层上卷 date → month → year；`picker` 决定「点到哪一层就提交」
  - `minDate` / `maxDate` / `disabledDate` / `displayFormat` / `clearable` / `showToday`
  - 年份面板按**十年段**对齐（2020–2029 + 前后各一格补位），不是十二年段 —— 人对「20 年代」
    有直觉，2016–2027 这种切法读起来没有着落

- **`TimePicker`** —— 零依赖时间选择器（forms/datetime）。此前只有 `_mui/TimeField`
  （分段键盘输入、无浮层、无 min/max/step），要 el-time-picker 那种「点开选」只能自己搓。
  时/分/秒三列浮层 + `minuteStep`/`secondStep` + `minTime`/`maxTime` 逐列禁用。
  两处值得记下的实现取舍：
  1. **逐列禁用的判据是「整段与范围有无交集」，不是「端点是否越界」**。`minTime="09:30"` 时
     9 点这一格仍可选（9:30~9:59 可达），被禁的是 9 点内 30 分之前的分钟；照「端点越界即禁」
     写会把整个 9 点误禁
  2. **尚未选值时存在一个隐含基准** `clamp(00:00:00, [min,max])`。否则 `minTime="09:30"` 下
     基准小时恒为 0，分钟列会被整列判死，面板看着像坏了
  另导出 `parseTime` / `formatTimeParts` / `clampTime` / `snapToStep` 等纯函数供表单校验复用
  （`formatTime` 已被 Video 占用，故对外叫 `formatTimeParts`）。

- **`IconPicker`**（gap-matrix a8）—— 分类页签 + 跨类搜索（名字/中文别名）+ 网格 + 最近使用。
  **图标集不进组件库**：`sources[].renderIcon` 把「名字 → 节点」的映射交给消费方，
  lucide / iconfont / 本地 svg 三种来源都能接，库自身不为了一个选择器把几千个图标打进每个包里。
  搜索**跨全部分类**（用户找图标时心里没有「它属于哪一类」这个概念），故搜索期间分类页签隐藏。

- **`RouteTabs`**（gap-matrix a17）—— 中后台多标签工作区那条页签栏，从 `AdminLayout` 里抽出来
  独立可用。补齐右键菜单（关闭其他/左侧/右侧/全部/刷新）、固定页签、拖拽调序、
  激活项滚入视口、溢出左右滚动按钮。
  **顺带根治一个真 bug**：`AdminLayout` 内置那版在受控模式下「关闭其他/全部」只调了 `setActive`、
  没有任何对外回调，消费方点了看着毫无反应；且「关闭全部」实为 `closeOthers`，与菜单文案对不上。
  现在 `AdminLayout` 内嵌 `RouteTabs` 并新增 `onTabsAction` 出口（受控时是唯一出口），
  `closeAll` 也修正为「关全部可关页签（含当前页）」。批量动作的判定抽成纯函数
  （`affectedKeys` / `nextActiveKey` / `isClosable` / `orderTabs` / `reorderTabs`）一并导出，
  让消费方与组件用同一份口径，不各算各的。

**既有组件增强**

- **`Tree` 虚拟滚动 + 拖拽排序**（gap-matrix a13 后半 + 5069tk #7）
  - `virtual`：几百上千节点的权限树/组织树。**开启后强制平铺渲染** —— 没有展开过渡、
    `showLine` 连接线失效（平铺后没有嵌套 DOM 可挂线），已写进禁忌区
  - `draggable` + `onDrop` + `allowDropInside`：原生 HTML5 拖放，**不引 dnd-kit**
    （Table 刚为「不开拖拽也被迫拉起整条 dnd-kit」付过代价）。顺序不归组件，
    `onDrop` 只回传「谁落到谁的哪一侧」。已拦三种非法落点：丢到自己身上、丢进自己的子树（成环）、
    `inside` 到自己的直接父级（等于没动却会触发一次写库）
  - 落点几何函数对**非有限值**做了守卫：NaN 参与比较时两个分支都为假，会静默落到 `inside`
    ——那是改父级，三种落点里最危险的一种

- **`SearchForm` 控件类型补齐**（gap-matrix a14）：新增 `number` / `number-range` /
  `datetime` / `datetime-range` / `multi-select` / `remote-select`（后者直接复用 RemoteSelect 的
  `fetcher` / `resolveValue` 契约，不另立平行类型）。值形状按类型定：`*-range` 恒为二元组、
  多值字段为数组，重置后各自回到对应空形状。
  **operator 刻意不进 `SearchForm`** —— 那是后端查询契约，塞进来会让通用组件编码某一家后端的协议。

- **`_mui/DatePicker` / `DateTimePicker` 透传补齐**（gap-matrix a9）：`views` / `openTo` /
  `format` / `disabledDate`。`disabledDate` 对外收 ISO 日期串、在桥这层转 Dayjs，
  免得消费方为一个禁用判定被迫认识 dayjs。

- **`Sparkline` 新增 `baseline`**（5069tk #12）：在指定数值处画一条横向虚线（上期均值 / 目标值 /
  及格线），让序列有个「对比的参照」而不只是形状。基准值会一并纳入归一化域，保证它落在视口内。
  另导出纯函数 `valueToY`，与 `normalize` 共用同一条归一口径。

- **`ProTable` 改吃 `Pagination` 的 `totalItems`**：不再在内部手算 `Math.ceil(total/pageSize)`，
  页数换算只留一处，边界（0 条 / 整除）不会两边各算各的。

- **`Listbox` 新增 `style`**：用于表达 Tailwind 类给不出的动态值（`Transfer` 的 `listHeight` 要用）。

**新增 i18n 文案**：`adminLayout.closeLeft` / `closeRight` / `refreshTab` / `scrollLeft` / `scrollRight`。

**行为变化提示**：`AdminLayout` 的「关闭全部」语义修正为关全部可关页签（此前等同「关闭其他」）；
受控页签的批量动作现在需要接 `onTabsAction` 才会生效（此前根本不生效）。其余全部为可选新 prop
或新组件，既有用法零影响。
