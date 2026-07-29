---
"@hulianui/ui": minor
---

清 issue #24–#29，外加两处自查发现的真 bug

**#24 packaging：源码里的裸 `process` 让消费方 tsc 直接失败**

新增内部 `lib/is-dev.ts`（模块作用域 `declare const process`），`pagination` 与 `animated-theme-toggler` 的开发期告警改用它。装 `@types/node` 是更坏的解——它会把整套 Node 全局类型灌进浏览器端消费方，`setTimeout` 从此返回 `NodeJS.Timeout` 而非 `number`，反倒掩盖真实的平台错配。

同时给 CI 加了「以消费方身份 typecheck」门禁（`pnpm pack` 产物 + 仓库外临时目录 + 不装 `@types/node`）。这次的本质不是那两行代码，而是**库的自查环境比消费方宽松**——`packages/ui` 的 tsconfig 里 `types: ["vitest/globals"]` 让 `@types/node` 经 vitest 类型链混了进来，于是「库内 tsc 绿、装出去就挂」这一类问题会持续漏网。

**#25 Heatmap：区分「无数据」与「值为 0」**

新增 `emptyCellTone`；`buildMatrix` 的 `get` 缺席时返回 `undefined` 而非 `?? 0`；`HeatmapCellInfo` 增加 `empty` 字段供 `formatTooltip` 判别。

⚠️ **一处行为变更**：缺席格的默认 tooltip / `aria-label` 文案从 `Y · X：0` 改为 `Y · X：无数据`，且不受 `emptyCellTone` 门控。颜色保持完全向后兼容（不传 `emptyCellTone` 时与旧版逐字节一致），但 aria-label 谎报「0」属于无障碍缺陷，不宜再 gate。**若你的测试或 e2e 按 aria-label / title 定位缺席格，需要更新选择器。**

**#26 Sortable：行内交互元素不再劫持拖拽（指针 + 键盘双路）**

指针路径加 `InteractiveAwarePointerSensor`；键盘路径把 `<li>` 登记为 `activatorNode`，让 dnd-kit 上游那句 `if (activator && event.target !== activator) return false` 生效——此前 `activatorNode` 为 null 会让整条守卫被跳过，行内按钮上的 Enter 被 `preventDefault` 吞掉，键盘用户根本按不动。`handle` 从此只是取向选择，不再是「避免劫持子元素」的必需补丁。

**#27 TreeSelect：新增 `clearable`**，对齐 Select 已有的语义与视觉。此前单选选中后无法在组件内回到未选态，筛选条件只能收窄不能放宽。

**#28 Sortable：`renderItem` 的 state 增加 `index`**，省掉消费方 `findIndex` 兜回来，也让行内控件能有带序号的唯一 `aria-label`。

**#29 Stat：新增 `hint`**（与趋势无关的注脚槽），并对「传了 `deltaLabel` 却没有 `delta`」补开发期告警——原先是静默吞掉，TS 过、控制台干净、页面只少一行字，属最难查的一类。

**自查发现的两处真 bug（非上述 issue）**

- **Kanban 整卡拖拽此前完全失效**：卡片守卫用的是无边界 `closest("…[role='button']…")`，而 dnd-kit 会给可拖卡片挂 `role="button"`——守卫命中卡片自己，于是每次按下都被判成「按在交互元素上」。原有测试全部用孤立 `createElement` 断言，测不到真实渲染的卡片，因此一直绿着。现已抽出 `lib/drag-guard.ts` 与 Sortable 共用同一份带边界的实现，并补了基于真实渲染的回归测试。
- **Dialog / Drawer 正文滚动区裁掉焦点环**：`overflow-y-auto` 会连带把 `overflow-x` 从 `visible` 变成裁剪（CSS 规范：一轴非 visible 时另一轴的 visible 计算成 auto），而 `w-full` 表单控件与滚动容器左右边界零余量，`ring-2 + ring-offset-2` 向外 4px 的两条竖边整条被切掉（症状是「聚焦只剩上下两条线」）。横向改为经 `--hl-overlay-pad` 变量做负边距补偿——覆盖 Popup 内边距时需一并覆盖该变量。

  纵向同样要留（`mt-3 pt-1` / `-mb-1 pb-1`，视觉间距净变化为零）：表单最后一个控件的下边界与滚动容器完全贴合，环往下那 4px 一样会被切掉。纵向只留 4px 而非跟横向一样借 24px——上下方紧挨着标题与 footer，借多了滚动内容会从标题底下穿出一大截。
- **ModalForm / DrawerForm 的操作按钮**从滚动区移进 `footer` 槽（经 HTML `form` 属性关联提交），长表单时按钮不再跟着滚走。

**其它**

- 开发期误用告警统一走新的 `lib/warn-once.ts`，同一误用整个进程只打一次（原先写在 render body 里，每次重渲染都打、StrictMode 下翻倍）。
- FAB 补 `draggable` 示例与文档（此前 showcase 里没有任何可拖示例，用户会以为拖拽坏了）；拖拽期间不再套用按压缩放（缩小表达「按进平面」，与拖拽的「拿起来移动」语义相反），并补上缺失的 `onPointerCancel` 重置。
