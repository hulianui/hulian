---
slug: inspector-panel
name: InspectorPanel
category: forms
group: advanced
tags: []
exports: [InspectorPanel, MIXED, borderFields, colorFields, effectsFields, fieldTokens, formatLength, inspectorSections, isMixed, layoutFields, matchToken, parseLength, readInspectorValue, spacingSides, tokenColor, typographyFields]
status: enriched
---

# InspectorPanel

> 设计工具属性检查器 · **字段 schema 驱动**（给一份 `{ key, label, kind }` 就派生控件，不是写死五个分类）· 七种控件 kind 全部换皮自既有表单件 · spacing 四联 + 链接锁定同步四值 · 主题 token 色板绑定 · MIXED 混合值占位 · commitMode 决定拖动中还是松手才回吐 · forms/advanced

## 何时用

设计工具 / 低代码搭建器里与选中元素双向绑定的右侧属性面板：把一组属性描述成 schema，面板按 `kind` 派生控件、按 `key` 读值、按 `key` 回吐。

不是「表单」：提交语义、校验、字段依赖请用 [Form](../form/form.md) / [ProForm](../pro-form/pro-form.md)；单个属性的编辑控件直接用 [Slider](../slider/slider.md) / [ColorPicker](../colorpicker/colorpicker.md) / [Segmented](../segmented/segmented.md)，不必套面板。内置的 5 类预设只是默认值，业务属性（权重、跳转方式、置顶）同样可以用它，见「自定义 schema」示例。

## 导入
```ts
import { InspectorPanel, MIXED, inspectorSections, layoutFields, spacingSides } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| onChange * | (path: string, value: InspectorValue) => void | - | 单 path 变更回吐，`path` 就是字段声明的 `key` |
| props | Record\<string, unknown\> | - | 属性值表；先按扁平键命中，未命中再按 `a.b.c` 点号下钻 |
| selectedElement | string ｜ null | - | 选中元素标识；显式传 `null` 进空态，不传则不判空 |
| sections | InspectorSection[] | - | 完整分类 schema；传了它 `categories` 失效 |
| categories | readonly string[] | - | 只取内置预设的这几类，且**按传入顺序**排列（`layout` / `color` / `typography` / `border` / `effects`） |
| tokenSource | readonly InspectorToken[] | - | 色值控件可选的主题 token；形状与文档站 `SEMANTIC_GROUPS` 的色卡一致 |
| commitMode | "change" ｜ "commit" | "change" | `change` 拖动/按键即回吐；`commit` 松手/失焦/回车才回吐 |
| density | "comfortable" ｜ "compact" | "comfortable" | 行高与内边距密度；`compact` 收紧到接近 Sketch 检查器的量级 |
| onBatchChange | (changes: InspectorChange[]) => void | - | 一次交互改多个 path 时的批量回吐（见下方 Events） |
| title | ReactNode | 取自 locale | 面板标题；传 `null` 不渲染标题栏 |
| emptyText | ReactNode | 取自 locale | 空态文案 |
| labels | Partial\<InspectorPanelLabels\> | - | 覆盖取自 locale 的文案（`mixed` / `linkSides` / 四边名 等） |
| className | string | - | 面板外层类名 |

字段类型（`InspectorField` 判别联合，按 `kind` 收窄）：

| kind | 派生控件 | 该 kind 特有字段 |
|------|------|------|
| spacing | 四个数字框 + 链接锁定钮 | `sides?`（覆盖派生 path）· `min` / `max` / `step` / `unit` |
| color | 色块（弹出 ColorPicker）+ 文本框 + token 色板 | `tokenGroup?` |
| length | 滑杆 + 数字框 | `min` / `max` / `step` / `unit` |
| number | 数字框 | `min` / `max` / `step` / `unit` |
| enum | ≤4 项 Segmented，更多 Select | `options` * · `display?: "segmented" ｜ "select"` |
| toggle | Switch | - |
| text | 文本框 | `placeholder?` |

公共字段：`key` *（属性路径，同时是回吐的 path）· `label` *（可见标签 + 控件 `aria-label`）· `hint?` · `disabled?`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | (path: string, value: InspectorValue) => void | 每个被改动的 path 触发一次。链接锁定的 spacing 会在同一 tick 连发 4 次 |
| onBatchChange | (changes: InspectorChange[]) => void | 传了它，**多 path** 变更只走它，不再逐条 `onChange`；单 path 变更始终走 `onChange` |

回吐值形态由字段自己决定，不看输入形态：`unit` 有值回吐 `"12px"` 字符串，无 `unit` 回吐数字 `12`；数字框清空回吐 `null`（= 删除该属性，不是 `0`）；token 色块回吐该 token 的 `value`，没写 `value` 就回吐 `var(--token)`。

## 示例
```tsx
const [style, setStyle] = useState<Record<string, unknown>>({ paddingTop: "24px" });

<InspectorPanel
  selectedElement="Card / Title"
  props={style}
  tokenSource={[
    { token: "color-primary", label: "主色", group: "text" },
    { token: "color-surface", label: "卡片表面", group: "surface" },
  ]}
  // 链接锁定会连发 4 次，必须函数式更新
  onChange={(path, value) => setStyle((prev) => ({ ...prev, [path]: value }))}
/>
```

自定义 schema（面板不认识任何具体属性，业务属性照样能用）：
```tsx
<InspectorPanel
  title="卡片配置"
  sections={[
    {
      id: "meta",
      label: "内容",
      fields: [
        { key: "headline", label: "标题", kind: "text" },
        { key: "featured", label: "置顶", kind: "toggle" },
        { key: "weight", label: "权重", kind: "number", min: 0, max: 999, hint: "越大越靠前" },
      ],
    },
  ]}
  props={values}
  onChange={(path, value) => setValues((prev) => ({ ...prev, [path]: value }))}
/>
```

多选混合值：
```tsx
<InspectorPanel
  selectedElement="3 个元素"
  commitMode="commit"
  props={{ fontSize: MIXED, opacity: MIXED, textAlign: "left" }}
  onChange={apply}
/>
```

纯函数单独用（拼 schema / 归一化值时不必挂组件）：
```ts
spacingSides("padding");                 // { top: "paddingTop", right: "paddingRight", … }
spacingSides("margin", { top: "gapY" }); // 只覆盖一边，其余仍走派生
parseLength("1.5rem");                   // 1.5
formatLength(12, "px");                  // "12px"
inspectorSections(["effects", "layout"]) // 按传入顺序取预设
readInspectorValue({ style: { color: "red" } }, "style.color"); // "red"
```

## 无障碍

- 每个控件都带 `aria-label`（取字段 `label`）；spacing 四个框各自是「内边距 上 / 右 / 下 / 左」，不会四个同名。
- `length` 的滑杆与数字框是同一属性的两种输入方式，共用同一可访问名（滑杆经 `aria-labelledby` 指向可见标签），角色不同所以读屏可区分。
- 链接锁定钮用 `aria-pressed` 表达开关态，不是靠颜色。
- token 色块的无障碍名取 `tokenSource[].label`（缺省回退到 `token`），不是 `var(--color-x)` 变量串——读屏念的是「主色」而不是一串变量名。色板下方那行 token 名是给视觉用户的当前值读数，不是无障碍兜底。
- 分类折叠走 [Collapsible](../collapsible/collapsible.md)，`aria-expanded` 由它维护；键盘可达。
- 混合值不靠灰色暗示：文本/数字类走 `placeholder`，开关/枚举旁边有可读文字，读屏能听见。

## 禁忌 / 坑

- **设计工具语境请开 `columns` + `density="compact"`**。`X / Y / 旋转` 这类数值本该一行三格、标签内联进输入框；一行一个字段配 80px 标签列，同样内容要占三倍高度。多列模式下数值字段自动内联标签，并且标签本身成为**拖拽调值**的抓手（横向每 1px 一个 `step`，按住 Shift 走 10 倍）。窄栏（<260px）下网格自动退回单列——每格不足 70px 时分列没有意义。
- 拖拽抓手 `aria-hidden` 且不进 tab 顺序：调值的可达通路是输入框自己（方向键 / 直接输入），拖拽只是给鼠标用户的加速方式，不该多出一个屏幕阅读器要念的控件。
- **「一组里可增删多条」（填充 / 边框 / 阴影各挂若干条）尚未支持**。当前 schema 是「一个 key 对应一个值」，多条同类样式需要值模型从 `Record<string, unknown>` 变成带数组的结构，属于独立的一次设计，不在本版范围内。现在的替代做法是消费方自己按条展开成 `fill1Color` / `fill2Color` 这样的扁平 key。

- **窄栏下枚举字段自动从分段控件降级为下拉**。面板宽度低于 260px 时（侧栏检查器的常见宽度），`kind: "enum"` 且**未显式指定 `display`** 的字段会切成 `select`——四段中文在那个宽度下装不下，硬撑就会出现「存在但不可达的选项」（#114）。显式传了 `display` 就尊重消费方，不再自适应。
- 判定看的是**面板自身的宽度**（ResizeObserver），不是视口宽度：决定控件形态的是「它有多宽」。jsdom 下没有 ResizeObserver，单测里不会触发降级。

- **`onChange` 会在同一 tick 连发多次**（链接锁定的 spacing 是 4 次）。消费方必须用函数式更新 `setState((prev) => …)`，写成 `setState({ ...style, [path]: value })` 会让后三次覆盖前三次，表现为「只有最后一边生效」。嫌麻烦就传 `onBatchChange` 一次拿全。
- `commitMode` 覆盖滑杆、输入框与色块弹出的 ColorPicker 三者。`commit` 模式下取色器松手 / 失焦 / 回车才回吐，拖动中的每帧值只留在面板内部（取色器此时是非受控的，外部 `props` 变了才会重新同步）。
- `tokenSource[].token` **必须带 `color-` 前缀**（`color-primary` 而不是 `primary`）。Tailwind v4 `@theme` 的真名带前缀，写成裸名色板会画不出颜色也不报错。
- 混合值哨兵是 `Symbol.for("hulian.inspector.mixed")`，**不能 JSON 序列化**。属性表要过一遍网络/存储时，在边界上把它转成自己的标记再转回来。
- 数字框清空回吐 `null` 不是 `0`。消费方要区分「没设置」和「设成 0」，`null` 应当删除该属性而不是写 `0`。
- 面板不持有业务值：`props` 不回写，控件就不会动（`commit` 模式的输入草稿与拖动中的滑块除外）。它是受控组件，不是自带状态的编辑器。
- 面板自身的文案（`title` / 空态 / `mixed` / `linkSides` / 四边名 / 两个色值控件名）走 ConfigProvider 的 locale，外层包 `<ConfigProvider locale={enUS}>` 即变英文。优先级是 `labels` / `title` / `emptyText` prop > locale > 内置中文兜底。
- **内置预设的字段 `label` 仍是中文**，不在 locale 覆盖范围内——它们属于 `sections` 数据而不是面板本身。要整屏英文请自带 `sections`。

## 相关
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md) · [Slider](../slider/slider.md) · [Segmented](../segmented/segmented.md) · [Collapsible](../collapsible/collapsible.md) · [Flow](../flow/flow.md)
