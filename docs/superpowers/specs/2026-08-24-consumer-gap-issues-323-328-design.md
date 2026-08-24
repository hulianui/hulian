# 消费方布局与多选体验缺口（Issues #323–#328）设计

**日期：** 2026-08-24

**状态：** 待用户书面审阅（实现尚未开始）

**目标：** 用一组向后兼容的公共 API 补齐消费方审计中已确认的 Stack、Card、Text、DotField 与 Select 缺口，并在合并、发版和真实消费验证后关闭 umbrella Issue #323。

## 1. 背景与成功标准

Issue #323 汇总了消费方项目中残留的布局与展示补丁；#324–#327 是它的具体子问题，#328 是同批发现的多选体验缺口。问题的共同点不是组件缺少任意样式能力，而是调用方为了完成常见业务界面，仍需依赖瑚琏没有表达的稳定语义。

本批完成时必须同时满足以下条件：

1. `StackItem` 能表达弹性增长、禁止收缩和 `min-width: 0`，调用方无需把这三个 Tailwind 工具类散落在业务代码中。
2. `Card size="sm"` 能整体收紧 Header、Body、Footer 间距；`CardBody` 不再强制正文为 `text-sm`。
3. `Text` 能声明 sans/mono 字族与等宽数字，不再要求调用方直接写 `font-mono`、`tabular-nums`。
4. `DotField` 以绝对定位覆盖父容器，在内容决定高度的父容器中仍填满背景，同时保留鼠标交互。
5. `Select` 多选支持选中项优先排序以及可删除的 chips 触发器；默认模式的 DOM、视觉和行为保持不变。
6. 每个子 Issue 都有先失败、后通过且做过 mutation 的回归测试；DotField 与 Select 的关键交互在真实 Chromium 中验证。
7. #324–#328 以可独立审阅的提交进入同一批次 PR；该 PR 合并且主干门禁通过后关闭 #323–#328。
8. Changesets 版本 PR 合并、npm 发布、公开 registry/文档站验证全部完成后，才把本批称为“已发版”。

## 2. 范围与非目标

### 2.1 本批范围

- #324：新增 polymorphic `StackItem`。
- #325：Card 尺寸语义与正文排版继承。
- #326：Text 字族与数字排版语义。
- #327：DotField 覆盖定位修复及同领域核查。
- #328：Select 多选排序与 chips 展示/删除。
- #323：作为 umbrella 追踪项，在上述能力全部交付后关闭，不增加单独的生产代码。
- 对应的类型、单元测试、浏览器测试、中文/英文文档、showcase、registry 与 changeset。

### 2.2 非目标

- 不提供任意 spacing、字体或布局值，也不把 Tailwind class 透传包装成新 API。
- 不改变 Stack 本身现有的方向、间距、对齐或响应式协议。
- 不改变 Card 的圆角、边框、阴影或 `divided` 语义。
- 不改变 Text 默认标签、默认字号、颜色或字重。
- 不把所有装饰背景组件机械地改成绝对定位；只修复经实现、文档和浏览器行为三者证明存在同一契约矛盾的组件。
- 不重写 Base UI Select/Combobox，不新增对象值，不为 searchable 模式恢复 `SelectGroup`。
- 不在本批合并 #322 的代码；#322 由先行 PR #329 独立交付，本批分支只以其最终主干结果为基线。

## 3. 公共 API

### 3.1 StackItem

新增并从 `@hulianui/ui` 导出：

```ts
export interface StackItemOwnProps {
  /** 占用主轴剩余空间。true -> flex-1。 */
  grow?: boolean;
  /** 是否允许收缩。false -> shrink-0；true/undefined 保持浏览器默认。 */
  shrink?: boolean;
  /** 允许 flex 子项内容收缩。0 -> min-w-0。 */
  minWidth?: 0;
  children?: ReactNode;
  className?: string;
}

export type StackItemProps<E extends ElementType = "div"> =
  PolymorphicProps<E, StackItemOwnProps>;
```

`StackItem` 默认渲染 `div`，支持与 `Stack` 相同的 polymorphic `as` 类型推导。所有新属性缺省时不增加尺寸类，因此普通包装元素不会意外改变现有 flex 行为。属性映射固定为：

| 属性 | 条件 | class |
| --- | --- | --- |
| `grow` | `true` | `flex-1` |
| `shrink` | `false` | `shrink-0` |
| `minWidth` | `0` | `min-w-0` |

这里不提供 `minWidth="auto"`：缺省状态已经是浏览器/工具类默认值，增加一个等价枚举只会扩大无效 API 面。

### 3.2 Card

`CardProps` 新增：

```ts
export type CardSize = "sm" | "md";

export interface CardProps {
  /** 整卡密度。@default "md" */
  size?: CardSize;
}
```

尺寸只由根 `Card` 控制，以 direct-child slot selector 同时作用于 `CardHeader`、`CardBody`、`CardFooter`：

| 区域 | `md`（默认，保持现状） | `sm` |
| --- | --- | --- |
| Header | `px-5 py-3` | `px-4 py-2.5` |
| Body | `px-5 py-4` | `px-4 py-3` |
| Footer | `px-5 py-3` | `px-4 py-2.5` |

`CardBody` 删除无条件 `text-sm`。正文排版由祖先或内容组件继承；CardHeader 自己的 title/description 语义不变。`divided={false}` 继续使用现有去分隔线和邻接间距规则，尺寸变量只替换基础 padding，不改变其结构逻辑。

### 3.3 Text

`TextOwnProps` 新增：

```ts
export type TextFamily = "sans" | "mono";

export interface TextOwnProps {
  /** 字族；不传时继承。 */
  family?: TextFamily;
  /** 使用等宽数字。@default false */
  numeric?: boolean;
}
```

映射为 `family="sans" -> font-sans`、`family="mono" -> font-mono`、`numeric -> tabular-nums`。`family` 缺省时不输出字族 class，以保留当前的继承行为；`numeric={false}` 或缺省时不输出数字排版 class。两个属性可组合，也可与现有 `size`、`tone`、`weight`、`truncate`、`lineClamp` 任意组合。

### 3.4 DotField

DotField 不新增公共属性。根节点的固定布局类由：

```txt
pointer-events-auto relative h-full w-full overflow-hidden
```

改为：

```txt
pointer-events-auto absolute inset-0 overflow-hidden
```

canvas 继续绝对定位填满根节点。父容器需要承担定位上下文（通常已有 `relative`）；这与 DotField 作为装饰背景层的文档契约一致。保留 `pointer-events-auto`，因此基于指针位置的动画不退化。

### 3.5 Select

`SelectProps` 新增：

```ts
export interface SelectProps {
  /** 多选时将当前已选项排在未选项之前。@default false */
  selectedFirst?: boolean;
}
```

`SelectTriggerProps` 新增：

```ts
export interface SelectTriggerProps {
  /** 多选值展示方式。@default "text" */
  display?: "text" | "chips";
  /** chips 模式下是否显示单项删除按钮。@default false */
  removable?: boolean;
}
```

约束如下：

- `selectedFirst` 只在 `multiple` 且值为数组时生效；单选或没有选中值时保持输入顺序。
- `display="chips"` 只改变多选的值展示；单选回退现有文本展示。
- `removable` 只在 `multiple && display="chips"` 时生效；其他组合不渲染删除控件。
- `maxDisplay` 同时适用于 text 与 chips；超过上限时追加 `+N` 汇总，不隐式删除未展示值。
- 现有 `clearable` 仍表示清除全部值；它与单个 chip 删除可同时存在。
- 缺省 `selectedFirst={false}`、`display="text"`、`removable={false}` 时，Trigger 的 DOM、可访问名称、键盘操作和当前样式必须保持不变。

## 4. 实现架构

### 4.1 StackItem 与导出链

`StackItem` 放在现有 Stack 模块中，共用 polymorphic helper 和 `cn`。实现不依赖 Stack context，也不要求必须是 Stack 的直接子节点；它只是一个带明确 flex-child 语义的包装组件。

模块 `index.ts`、根 barrel、registry 元数据与中英文文档同时导出/登记。Showcase 至少展示“左侧可截断内容 + 右侧固定操作”和“主内容 grow + 固定侧栏”，让三个属性的业务作用可见。

### 4.2 Card 尺寸传播

Card 已经通过 `data-slot` 和 direct-child selector 管理分区。新增 size variant 继续沿用这条路径，不增加 React context，也不修改 Header/Body/Footer 的 props。这样嵌套 Card 只受各自根节点直接子元素选择器影响，不发生祖先尺寸串染。

selector 的优先级必须让 `size` 与 `divided` 可组合。测试覆盖四个组合：默认、`sm`、默认且不分隔、`sm` 且不分隔。CardBody 的测试还需证明它不再输出 `text-sm`，并能继承调用方提供的排版 class。

### 4.3 Text class 映射

新增静态 `FAMILY_CLASS` 映射，与已有 size/tone/weight 映射同层组合。`numeric` 使用条件 class。现有 memo、ref、polymorphic 类型推导与 className 合并顺序不变，消费方 className 仍位于组件 class 列表末端。

### 4.4 DotField 定位与同领域核查

DotField 的修复是契约修正，不是视觉重构。单元测试断言根节点 `absolute inset-0` 且不再依赖 `h-full w-full`；浏览器测试构造一个 `position: relative`、高度仅由普通内容撑开的父容器，验证：

1. 加入 DotField 前后父容器高度一致，背景层不会参与正常文档流。
2. DotField 根节点与父容器边界相同。
3. canvas 与根节点边界相同。
4. 指针移动仍能驱动已有交互状态或绘制路径。

同领域核查限定在 decoration/backdrop 类组件：比较其文档承诺、根节点定位和典型调用方式。只有三项证据都证明组件应是覆盖层但实现仍参与文档流时，才纳入对应 Issue 的同一提交；单纯使用 `h-full w-full` 不构成修改理由。核查结论记录在提交或 PR 说明中，避免无证据扩大变更。

### 4.5 Select 数据排序

选中优先排序必须发生在交给 Base UI/Combobox 的候选序列层，而不是只用 CSS `order` 改视觉顺序。共享纯函数接收候选项和 `value: string[]`：

1. 以 `value` 数组建立选中顺序索引。
2. 输出仍存在于候选集合中的选中项，顺序严格跟随 `value`。
3. 追加所有未选项，保持它们原始相对顺序。
4. 忽略已经不在候选集合中的 stale value，不制造幽灵选项。
5. 不原地修改调用方的 `items` 或 React children。

标准平铺列表按上述规则重排 `SelectItem`。标准分组列表保持 `SelectGroup` 的组顺序和 label 不变，只在每个组内部把该组已选项提前；不会把选项移出原组。searchable 模式延续现有拍平分组的约定。

searchable 流程先执行当前搜索过滤，再对过滤结果执行选中优先排序。因此未命中查询的已选项不会被强行插入结果；命中的已选项仍置顶。排序结果进入现有 Combobox 数据和虚拟化输入，确保候选数达到 100 后虚拟列表看到的就是最终顺序，而不是渲染窗口内部排序。

### 4.6 Select chips DOM 与状态更新

HTML 不允许在 button 中嵌套 button。现有 Select Trigger 本身是 button，所以可删除 chips 采用与 `clearable` 相同的复合容器思路：

```txt
SelectTrigger wrapper
├── Base UI Trigger button
│   └── chip labels / +N（纯展示，无交互 button）
├── 每个可见 chip 的 remove button（Trigger 的 sibling）
└── clear-all button（可选，Trigger 的 sibling）
```

视觉上，remove button 与对应 chip label 共同呈现为一个 chip；DOM 中通过稳定的 value/data 属性建立对应关系。删除按钮必须：

- 使用 `type="button"`。
- `aria-label` 包含可读 label，例如“移除 北京”；label 不是纯文本时回退到 value。
- 在 `pointerdown`/`click` 中阻止事件触发 Select popup 切换，但不破坏按钮自身聚焦与 click。
- Enter/Space 只删除该值，不打开/关闭弹层，不清除其他值。
- 按当前 value 顺序过滤目标值，并调用与现有 Select 相同的受控/非受控状态通道和 `onValueChange(nextValues, details)`。
- disabled/readonly 语义遵从根 Select；不可用时不提供可操作的删除按钮。

Base Trigger 的可访问名称仍包含全部已选 label，而不是只包含当前可见 chip 或 `+N`。可通过视觉隐藏文本提供完整名称；删除按钮有各自名称。单击 chip 的非删除区域仍等同单击 Trigger，打开或关闭 popup。

## 5. 状态、边界与错误处理

- 受控 Select：单项删除只发出新数组，不直接持久改变 props；显示内容跟随父组件回传的 `value`。
- 非受控 Select：复用当前内部 value 通道更新显示并触发回调。
- value 中包含重复项时，显示和排序按 Base UI 当前规范去重，不通过本批建立重复值语义。
- item label 为复杂 ReactNode 时，视觉内容保持原节点；aria-label 回退 value，避免输出 `[object Object]`。
- `items` 与 children 同时存在时，继续遵循当前 Select 模式的数据来源规则；本批不引入第三套同步源。
- searchable 未提供 `items` 的现有错误/降级行为保持不变。
- DotField 没有定位父元素时会相对最近定位祖先/初始包含块定位；文档和 showcase 必须明确父容器应为 `relative`，组件不在运行时猜测或修改父节点。
- 所有 API 均为 additive 或默认行为修正，不移除导出。CardBody 字号继承是有意的视觉兼容修复，changeset 明确提醒依赖隐式 `text-sm` 的调用方在内容层声明字号。

## 6. 文档、Showcase 与生成产物

每个组件同步更新：

- 中文 `.md` 与英文 `.en.md`：API 表、默认值、最小示例、兼容说明。
- Showcase：只展示新能力解决的真实布局，不增加无法复用的演示专用 CSS。
- 类型导出和模块 `index.ts`。
- registry/LLM 生成输入；执行 `pnpm llms-registry && pnpm conventions` 后校验生成统计与漂移。
- Select 的本地化文案：提供 chip 单项删除的中英文可访问名称模板；不把中文字符串硬编码在通用交互实现中。

新增一个 `@hulianui/ui` minor changeset，概述五项公共能力和 CardBody 排版继承变化。先行 #322 的 patch changeset 若与本批同时进入 Version Packages，Changesets 取更高的 minor 版本；最终版本号以版本 PR 实际计算为准，不在功能 PR 中手填。

## 7. 测试设计

所有子项遵循 red → green → refactor；每条关键回归在实现后做一次 mutation，临时改坏对应生产逻辑并确认测试因预期原因失败，再恢复实现。

### 7.1 单元与类型测试

- StackItem：默认无尺寸类；三个属性单独及组合映射；className 合并；`as="section"`/`as="button"` 类型与 ref。
- Card：`md` 默认 class、`sm` 三分区 class、`divided` 组合、嵌套 Card 不串染、CardBody 无 `text-sm`。
- Text：family 映射、numeric、组合、缺省继承、不破坏 polymorphic props。
- DotField：固定布局 class 与交互 handler 保留。
- Select 排序纯函数：value 顺序、未选稳定性、stale value、空值、不变性、分组内排序、搜索后排序、100+ items。
- Select Trigger：默认 DOM 快照/查询不变；chips、`maxDisplay`、复杂 label 回退、removable 条件、clearable 共存。
- Select 状态：受控与非受控删除回调值、disabled/readonly、删除最后一项、重复快速操作。

### 7.2 Chromium 浏览器测试

- DotField：内容驱动父高度、root/canvas 几何边界、指针交互。
- Select 标准模式：鼠标打开、选中排序、单 chip 删除、clear-all。
- Select searchable：过滤优先、匹配的 selected-first、未匹配选中项不强插。
- Select virtualized：至少 120 项，选中位于原始列表尾部，打开后出现在虚拟化数据首部并可操作。
- Select 键盘：Trigger Enter/Space、remove button Tab 可达、Enter/Space 单独删除且 popup 状态不意外变化。
- 可访问性：无 nested interactive 元素；Trigger 和删除按钮均有稳定可读名称。

### 7.3 批次门禁

在使用 `.nvmrc` 指定的 Node 版本后，以干净工作树重新运行：

```bash
pnpm llms-registry
pnpm conventions
pnpm test
pnpm typecheck
pnpm test:scripts
pnpm size
pnpm --filter @hulianui/ui exec vitest run --project browser
pnpm --filter www build
git diff --check
```

若仓库脚本名称在实施期间由主干改变，以当时 `package.json` 和 CI workflow 的实际门禁为准，并在 PR 中记录替代关系。不能用“测试文件已增加”代替浏览器命令实际通过。

## 8. 提交、PR、合并与发版流程

### 8.1 依赖顺序

1. 等待 PR #329 的全部必需检查成功，合并 #322。
2. 确认 `origin/master` 包含 #322 的 feature SHA，并把本批分支安全同步到该主干；不得重复合并本地等价提交。
3. 按 #324、#325、#326、#327、#328 顺序实施。每个 Issue 使用独立提交，包含该项生产代码、测试、文档和 showcase；公共 changeset 放在批次收口提交或最后一个功能提交中。
4. 运行全量门禁并开一个 batch PR，正文分别写明 `Closes #323` 至 `Closes #328`，列出每项验证证据。
5. PR 评审和 CI 全绿后合并；确认 `master` 包含 batch feature SHA，Issues 实际关闭，主干 CI/部署成功。
6. 观察 Release workflow。若 Changesets action 成功创建/更新 Version Packages PR，则审阅并合并；若组织权限阻止 action 创建 PR，则按仓库发布文档在 release branch 本地运行 `pnpm version-packages`，以独立 PR 提交版本产物。
7. 版本 PR 合并后验证 npm dist-tag/包版本、公开文档/registry endpoint，以及一个全新临时消费方安装新版本后的类型和关键用例。

### 8.2 完成口径

以下状态必须分开报告：

- **本地完成：** 代码与测试在隔离 worktree 通过。
- **PR 完成：** batch PR 已创建且检查通过。
- **Issue 交付：** PR 已合并、master 包含 feature SHA、主干 CI/部署健康且 Issue 已关闭。
- **发版完成：** 版本 PR 已合并、npm/public site 可见、全新消费方验证通过。

任一后续状态失败时保留已通过的证据，但不能把前一状态描述成后一状态。

## 9. 回滚与故障边界

- 单个子项回归时优先 revert 该 Issue 的独立提交；避免回滚整个 batch 造成无关能力丢失。
- Select chips 若出现可访问性或 popup 事件回归，可回退 #328 而不影响 #324–#327。
- DotField 若特定消费方没有定位父元素，先修正文档/调用方契约或 revert #327；不在补丁中自动修改父 DOM 样式。
- npm 发布不可覆盖既有版本。发布后发现问题时使用新的 patch 版本修复，不重写 dist-tag 对应包内容。
- Release workflow、npm、文档部署和 registry 任一环节失败都按独立故障处理并保留可回滚 SHA；只有全部恢复后才宣布发版完成。

## 10. 审阅决策摘要

本设计选择“小而明确的语义 API + 默认完全兼容”路线：#324–#327 补齐稳定布局/排版契约，#328 在现有 Select 状态通道和 Base UI 数据链上增加排序与 chips，不建立平行组件。#323 只承担交付追踪；发布链仍遵循功能 PR、版本 PR、npm 与公开消费验证四个独立证据层级。
