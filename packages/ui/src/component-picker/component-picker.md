---
slug: component-picker
name: ComponentPicker
category: data-display
group: collection
tags: []
exports: [ALL_CATEGORY_KEY, ComponentPicker, ComponentPickerCommand, buildCategoryTree, defaultPropsOf, fuzzyMatch, matchesCategory, parseComponentCatalog, rankComponents, scoreComponent]
status: enriched
---

# ComponentPicker

> 组件库浏览器 · 左分类树(复用 Tree) + 顶部模糊搜索 + 结果网格(Card) + 详情面板(预览/Props 表/示例代码三开关) · 自研零依赖打分器(slug 命中远重于描述命中·不引 fuse.js) + `parseComponentCatalog` 把 llms-full.txt 解析成条目(纯函数·在消费方那层跑) + `renderPreview` 注入 live 预览(库不 eval 不 iframe) · 附 ComponentPickerCommand 薄封装走 ⌘K · data-display/collection

## 何时用

要在自己的产品里放一个「组件目录浏览器」——搜索组件、按分类筛、看 props 表和示例代码、选中后回吐 slug——用它。典型场景是 AI 建站工具的组件面板、内部设计系统门户、低代码编辑器的物料区。

- 只要一个 ⌘K 快速跳转、不需要属性表与分类树 → 直接用 [Command](../command/command.md)，或用本文件导出的 `ComponentPickerCommand`（内部就是 Command + 同一个打分器）。
- 要选的是图标而不是组件 → [IconPicker](../icon-picker/icon-picker.md)；选表情 → [EmojiPicker](../emoji-picker/emoji-picker.md)。
- 要的是通用「带查询区的列表页」而不是组件目录 → [ProTable](../pro-table/pro-table.md)。

**三条刻意的边界**（不是没做完）：

1. **不取数**。`items` 由消费方传入。库组件不该假设运行环境有 `llms-full.txt`，更不该在渲染里发网络请求。要从那份文件来，在你自己那层调纯函数 `parseComponentCatalog(text)`。
2. **不渲染任意组件**。库里没有 slug → 组件的映射，也不会 eval 字符串或塞 iframe。要 live 预览就用 `renderPreview` 注入；不传显示占位。
3. **不引 fuse.js**。打分器是本目录的纯函数，判据是「slug / name 命中远重于 description 命中」——通用库做不到这一点，搜 `btn` 时描述里恰好散着 b/t/n 的组件会排到 Button 前面。

## 导入
```ts
import {
  ALL_CATEGORY_KEY,
  ComponentPicker,
  ComponentPickerCommand,
  buildCategoryTree,
  defaultPropsOf,
  fuzzyMatch,
  matchesCategory,
  parseComponentCatalog,
  rankComponents,
  scoreComponent,
} from "@hulianui/ui"
```

## Props

`ComponentPickerProps`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | ComponentPickerItem[] | - | 组件目录。空数组渲染「目录为空」空态（区别于「无匹配结果」） |
| filter | ComponentPickerFilter | - | 受控筛选态 `{ category?, search? }`。传了必须接 `onFilterChange`，否则搜索框和分类树点了不动 |
| defaultFilter | ComponentPickerFilter | `{}` | 非受控初始筛选态 |
| showTree | boolean | `true` | 是否显示左侧分类树 |
| showPreview | boolean | `false` | 详情面板是否显示预览区 |
| showProps | boolean | `true` | 详情面板是否显示 Props 表（复用 Table） |
| showExamples | boolean | `true` | 详情面板是否显示示例代码（复用 CodeBlock） |
| activeSlug | string ｜ null | - | 受控高亮项（详情面板展示的那个） |
| defaultActiveSlug | string ｜ null | `null` | 非受控初始高亮项 |
| maxResults | number | `60` | 结果区最多渲染多少条 |
| labels | Partial\<ComponentPickerLabels\> | - | 界面文案覆盖，可整体或逐条；不传则取 ConfigProvider 的 locale（内置兜底 zh-CN） |
| className | string | - | 外层类名。**须给确定高度**（如 `h-[560px]`），组件内部按 flex 填满、各区独立滚动 |

`ComponentPickerItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| slug * | `string` | - | 唯一键，也是 `onSelect` 的第一个入参 |
| name * | `string` | - | 展示名（PascalCase 导出名） |
| description * | `string` | - | 一句话说明 |
| category * | `string` | - | 一级分类（layout / forms / data-display…） |
| group * | `string` | - | 二级分组（container / advanced / collection…）；无分组给空串 |
| tags | `string[]` | - | 搜索用的补充关键词 |
| props | `ComponentPickerProp[]` | - | 详情面板的 Props 表数据，每项 `{ name, type?, default?, description?, required? }` |
| examples | `ComponentPickerExample[]` | - | 详情面板的示例代码，每项 `{ title?, lang?, code }` |

`ComponentPickerCommandProps`（薄封装：把目录塞进 Command 面板）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | `ComponentPickerItem[]` | - | 同上 |
| open * | `boolean` | - | 受控开关 |
| onOpenChange * | `(open: boolean) => void` | - | 开合回调 |
| onSelect | `(slug: string) => void` | - | 选中某项 |
| placeholder | `string` | 取 locale | 搜索框占位 |
| emptyMessage | `ReactNode` | 取 locale | 无匹配结果时的文案 |
| maxResults | `number` | `30` | 最多渲染多少条（注意与 `ComponentPickerProps` 的 60 不同） |
| groupByCategory | `boolean` | `true` | 按 category 分组，每组一个 heading |
| shortcut | `boolean` | `false` | 内置 ⌘K / Ctrl+K 开合 |
| aria-label | `string` | 取 locale | 面板的无障碍名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | (slug: string, props: Record\<string, unknown\>) => void | 确认选用。第二参由 `defaultPropsOf(item)` 派生——只收文档里写明的**字面量**默认值，函数/对象一律不猜 |
| onFilterChange | (filter: ComponentPickerFilter) => void | 搜索词或分类变化。受控（传了 `filter`）时这是唯一出口 |
| onActiveChange | (slug: string ｜ null) => void | 高亮项变化（点结果项 / 上下键 / Esc 清空） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderPreview | (item: ComponentPickerItem) => ReactNode | 注入 live 预览。不传时预览区显示占位，不是空白 |

## 纯函数

| 函数 | 签名 | 说明 |
|------|------|------|
| parseComponentCatalog | (text: string, options?: ParseCatalogOptions) => ComponentPickerItem[] | 把 `llms-full.txt` 解析成条目。缺哪节少哪个字段，不抛异常 |
| buildCategoryTree | (items, options?) => ComponentPickerCategoryNode[] | 派生「全部 → category → group」两级分类树（纯数据，含各级计数） |
| matchesCategory | (item, key?) => boolean | 条目是否落在某个分类 key 下；`undefined` / `"*"` 恒真 |
| defaultPropsOf | (item) => Record\<string, unknown\> | 由文档默认值派生初始 props |
| rankComponents | (items, query, options?) => RankedComponent[] | 排序 + 过滤。空 query 保持原序 |
| scoreComponent | (item, query) => number | 单条目打分；多词 AND 语义 |
| fuzzyMatch | (query, text) => FuzzyMatch ｜ null | 单段文本的模糊匹配，回传分数与命中下标 |

## 示例

```tsx
// 目录从 llms-full.txt 来 —— 解析在你这层跑，组件只管展示
const text = await fetch("/llms-full.txt").then((r) => r.text());
const items = parseComponentCatalog(text);

<ComponentPicker
  items={items}
  className="h-[560px]"
  showPreview
  renderPreview={(item) => REGISTRY[item.slug]?.() ?? null}
  onSelect={(slug, props) => insertIntoCanvas(slug, props)}
/>
```

```tsx
// 受控筛选：把搜索词同步进 URL query
const [filter, setFilter] = useState<ComponentPickerFilter>({ category: ALL_CATEGORY_KEY });

<ComponentPicker
  items={items}
  className="h-[560px]"
  filter={filter}
  onFilterChange={(next) => {
    setFilter(next);
    router.replace(`?q=${encodeURIComponent(next.search ?? "")}`);
  }}
/>
```

```tsx
// ⌘K 形态：已经知道要哪个组件时
const [open, setOpen] = useState(false);

<ComponentPickerCommand
  items={items}
  open={open}
  onOpenChange={setOpen}
  shortcut
  onSelect={(slug) => insertIntoCanvas(slug)}
/>
```

## 无障碍

- 搜索框是 `role="combobox"` + `aria-controls` / `aria-autocomplete="list"` / `aria-activedescendant`；结果网格是 `role="listbox"`，每张卡片是 `role="option"` + `aria-selected`。焦点始终留在搜索框，由 `aria-activedescendant` 指向当前高亮项——这是 WAI-ARIA 的 combobox 模式，不用把焦点在卡片间搬来搬去。
- 键盘：`↓` / `↑` 在结果间移动高亮（循环，未高亮时向下从首条、向上从末条开始）；`Enter` 选中；`Esc` 逐级退出（先清搜索词，词已空再清高亮）。高亮项自动 `scrollIntoView({ block: "nearest" })`。
- 分类树是 [Tree](../tree/tree.md) 的 `expandTrigger="icon"` 模式——只有箭头管展开，行的其余部分照常选中，所以父级分类（如整个 `forms`）本身可选。
- 详情面板是 `role="region"` + `aria-label`，读屏可直接跳入。

## 禁忌 / 坑

- **必须给确定高度**：`className` 不写高度时整块会塌成内容高度，各区的独立滚动全部失效（同 [Flow](../flow/flow.md) / [AdminLayout](../admin-layout/admin-layout.md) 的家风）。
- **受控 `filter` 必须接 `onFilterChange`**：只想给初值请用 `defaultFilter`。传了 `filter` 又不接回调，搜索框输入不进去、分类树点不动，看着像组件坏了。
- **`renderPreview` 不是可选的偷懒项，是唯一的预览路径**：库不会替你把 slug 变成组件实例。想省事就把 `showPreview` 保持 `false`（默认），别指望不传 `renderPreview` 也能看到东西。
- **`onSelect` 的第二参可能是 `{}`**：`defaultPropsOf` 只认 `true` / `false` / 数字 / 带引号字符串这类字面量默认值。文档里写成 `() => void`、`{...}`、`—` 的一律不进结果——这是诚实的空，不是解析失败。
- **`parseComponentCatalog` 的 slug 不是文档里写着的**：`llms-full.txt` 根本没有 slug 字段。函数先从全文的交叉引用链接里捞（`[Formula](…/components/math)` → `math`），捞不到再 kebab 化组件名。全库 376 条里靠这两步能全对，唯一的例外 `QRCode → qrcode` 由内置 override 兜住；你自己的文档有类似缩写就传 `slugOverrides`。
- **`maxResults` 是渲染上限不是搜索上限**：打分对全量条目跑完再截断，所以第 61 条永远是「排名第 61」而不是「被漏掉的」。要看全量把它调大，但 376 张卡片一次性铺开会明显掉帧。
- **界面文案默认跟随 locale**：不传 `labels` 时全部文案取 ConfigProvider 的 locale（未包 Provider 回落内置中文），`ComponentPickerCommand` 的 `placeholder` / `emptyMessage` 同理。优先级是 prop > locale > 内置兜底，所以只想改一两句时传 `labels` 的对应键即可，其余仍跟着整站语言走。
- **`ComponentPickerCommand` 不是主形态**：命令行放不下分类树和属性表。它内部用 `filter={() => true}` + `onQueryChange` 接管排序（Command 自己的过滤是子串匹配且不排序），所以它只解决「已经知道要哪个」那一半场景。
