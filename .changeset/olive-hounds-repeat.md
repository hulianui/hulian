---
"@hulianui/ui": minor
---

清空消费方本轮提的 14 条 issue（#158–#165 · #167–#172 · #174），并让新的 info 语义色真正落到组件上。

**新增件**

- `Label`：独立的表单标签原语，`<label>` + `htmlFor` + 原生属性透传。皮肤取自新导出的 `labelClass`，与 `Field` 的标签段**同一份来源** —— 两处各写一份字面量的话，改字号时只会改到一处，而消费方页面里「Field 出的标签」与「手搓的标签」是并存的，分叉当场可见（#161）。
- `KbdGroup`：组合键容器，统一间距、可配分隔符（默认 `+`，装饰性、不进无障碍树）、外层 `aria-label` 出口。仍不做 `Meta → ⌘` 符号映射 —— 键名该显示成什么取决于消费方的平台探测（#165）。
- `MenuCheckboxItem` / `MenuRadioGroup` / `MenuRadioItem` 与 `ContextMenu*` 对应三件：**这是补 a11y 语义，不是补 API**。此前只能用 `Item` + 自画勾，视觉一模一样，但 role 退化成 `menuitem`、没有 `aria-checked`，读屏用户听到的是几个平级动作，听不出这是一组互斥选项、也听不出当前选的是哪个（#170）。

**新能力**

- `AlertDialogContent` 加 `body` 与 `icon` 槽。`description` 底层渲染成 `<p>`，块级内容塞进去是非法嵌套、当场 hydration mismatch；`body` 渲染在说明之下、动作区之上，不包 `<p>`（#158）。
- `ComboboxInput` / `ComboboxTrigger` / `ComboboxChips` 透传原生属性，`ComboboxInput` 加 `prefix` 与 `showChevron`。剩余属性落到**内层 input**（`role="combobox"` 在那里）—— 挂在外壳 `<span>` 上的 `aria-label` / `id` / `onBlur` 是无效的（#160）。
- `Card` 加 `variant="plain"`，`AccordionPanel` / `CollapsiblePanel` / `PopoverContent` 加 `plain`：内容自带外观时，要的不是改皮肤而是**没有皮肤**。`Card` 的 `bg-surface` 同时从 base 挪进各变体，否则 plain 档怎么写都去不掉底色（#159 #162 #172）。
- `Field` 加 `orientation="horizontal"`：设置页「左标签右控件」的行式版式，a11y 串联、invalid 传导、error 渲染全部保留。错误行用 `col-span-full` 而非写死的 `col-span-2` —— 消费方换成三列模板时，写死的 2 只会盖住前两列（#161）。
- `Command` 加 `footer` 插槽（对齐 `ComboboxContent.footer` 的既有口径）。命令面板是模态的，页脚里的控件没有别处可放（#171）。
- `Prose` 补 `details` / `summary` 排版与嵌套区分，新增 `scrollableTables`。宽表那档里 `th` 不换行是**必需项不是修饰**：只给 `overflow-x-auto` 的话列会被压到 min-content（中文一列一字），内容永远不超出滚动容器，于是根本不滚（#168）。
- `CodeBlock` 加 `lineNumbers`。行号走 `aria-hidden` + `select-none`（否则框选复制会把行号一起带走）、`sticky left-0` 不被横向滚动带走、列宽按总行数位数算（#169）。
- `tokenizeCode` 支持 Python（`py` / `python` / `python3`）。此前落到 JS 分支不是「不着色」而是**着错色**：`#` 注释不认、`def` 不着色，而 Python 代码里出现的 `var` / `function` 反被误标成关键字 —— 看得到颜色，所以没人会怀疑它错了（#167）。

**修复**

- `Accordion` 把 Base UI Root 的泛型透传下去（默认 `string`）。此前经 `ComponentProps` 擦成 `unknown[]`，受控用法必然 TS2322，且 `value` 那条连 cast 都救不回来（#163）。
- `Command` 默认高亮首个可用项，加 `autoHighlight`（默认 `true`）。**这是行为变更**：此前「打字 → 回车」什么也不会发生，必须先按一次 `↓`，而这在视觉上完全看不出来。高亮同时改为按 value 跨批次找回 —— 消费方没把 `groups` 用 `useMemo` 包稳时（items 来自请求数据时很常见），不再出现「刚点亮就没了、回车时灵时不灵」（#174）。
- `PopoverContent` 的 `mt-2` 改为跟随标题/说明：两者都没有时它是浮层顶部一条消不掉的 8px 空白，`className="p-0"` 也救不回来。箭头另开 `arrow` 开关，**没有绑进 `plain`** —— 箭头是浮层与触发器的关系指示，不是内容皮肤，绑在一起是错的耦合（#172）。
- 缺 `ConfigProvider` 时开发期告警一次。回退策略不变（组件必须能脱离 Provider 渲染），只补可发现性：回退掉的多半是 `aria-label`，英文产品能带着一屏中文读屏标签活过一整轮迁移（#164）。

**观感变更**：`Alert` / `Banner` / `Callout` / `Toast` / `Notification` / `Modal` / `Result` / `EventStream` 的 `info` 语气，以及 `DiffStat` 的 `renamed`，改吃新的 `--color-info`（青蓝），不再借主色。此前借 primary 是因为库里根本没有 info 语义色 —— 而那正是消费方控诉的「提示条稀释品牌色权重」，库自己也在犯（#173）。
