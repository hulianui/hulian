---
slug: icon-picker
name: IconPicker
category: forms
group: advanced
tags: []
exports: [IconPicker]
status: enriched
---

# IconPicker

> 图标选择 · 分类页签 + 跨类搜索(名字/别名) + 网格 + 最近使用 · 图标集由消费方经 renderIcon 注入 · forms/advanced

## 何时用

让用户从一组图标里挑一个并把**图标名**存进后端时用 —— 菜单管理、分类配置、快捷入口这类。
选表情用 [EmojiPicker](../emoji-picker/emoji-picker.md)（结构同源，数据内置）。

## 导入
```ts
import { IconPicker } from "@hulianui/ui"
```

> **图标集不进组件库。** `sources[].renderIcon` 把「名字 → 节点」的映射交给你，
> 于是 lucide / iconfont / 本地 svg 三种来源都能接。瑚琏的 `_icons` 只有运行时必需的那几十个，
> 明确不做图标集 —— 不然一个选择器会把几千个图标打进每个消费方的包里。

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sources* | `IconPickerSource[]` | - | 图标来源分类。每项 `{ key, label, tabIcon?, icons, renderIcon }` |
| value | `string \| null` | - | 受控值（图标名） |
| defaultValue | `string \| null` | - | 非受控初始值 |
| columns | `number` | `8` | 网格列数 |
| searchable | `boolean` | `true` | 显示搜索框 |
| searchPlaceholder | `string` | `"搜索图标"` | 搜索框占位 |
| defaultSource | `string` | 第一个 | 初始分类 key |
| recent | `string[]` | - | 受控「最近使用」；省略则内部维护（最多 16 个，最新在前） |
| clearable | `boolean` | `true` | 有值时显示当前值行与清除按钮 |
| emptyMessage | `ReactNode` | `"没有匹配的图标"` | 搜索无结果文案 |
| className | `string` | - | 面板类名（调宽度用） |

`IconPickerSource`：

| 字段 | 类型 | 说明 |
|------|------|------|
| key* | `string` | 分类唯一 key |
| label* | `ReactNode` | 分类页签文字 |
| tabIcon | `ReactNode` | 分类页签图标（不给则显示 `label`） |
| icons* | `{ name: string; keywords?: string[] }[]` | 该分类的图标。`name` 即对外值，`keywords` 是搜索别名 |
| renderIcon* | `(name: string) => ReactNode` | 把图标名渲染成节点 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(name: string \| null) => void` | 选中/清空回调；清空回传 `null` |
| onRecentChange | `(recent: string[]) => void` | 最近使用变化（受控 `recent` 时用它落盘） |

## 示例
```tsx
import { Home, User, Settings } from "lucide-react"

const REGISTRY = { home: <Home />, user: <User />, settings: <Settings /> }

const SOURCES = [
  {
    key: "common",
    label: "常用",
    icons: [
      { name: "home", keywords: ["首页", "主页"] },
      { name: "user", keywords: ["用户", "账号"] },
      { name: "settings", keywords: ["设置"] },
    ],
    renderIcon: (name) => REGISTRY[name] ?? null,
  },
]

<IconPicker sources={SOURCES} value={icon} onValueChange={setIcon} />
```

放进弹层里用（表单里的「选图标」按钮）：
```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">{icon ?? "选择图标"}</Button>} />
  <PopoverContent className="p-0">
    <IconPicker sources={SOURCES} value={icon} onValueChange={setIcon} className="border-0" />
  </PopoverContent>
</Popover>
```

## 禁忌 / 坑

- **别把整个图标库塞进 `sources`**。`lucide-react` 有一千多个图标，全量 `import * as icons`
  会让 tree-shaking 彻底失效、包体暴涨。按业务实际用得到的那几十个建 registry。
- **搜索跨全部分类**，不只搜当前分类 —— 用户找图标时心里没有「它属于哪一类」这个概念。
  所以搜索期间分类页签会隐藏（留着会让人误以为只在当前类里搜）。
- `keywords` 是给中文用户的：图标名都是英文，不配别名的话「删除」搜不到 `trash`。
- **最近使用只存名字**。图标从 `sources` 里下掉后，那条记录解不出来源，组件直接跳过不渲染
  （而不是渲染一个空格子）。要持久化就走受控 `recent` + `onRecentChange` 自己落 localStorage。
- 对外值是**图标名字符串**，不是节点。渲染选中图标请用你自己的 `renderIcon`，
  组件不对外暴露节点。

## 相关
[EmojiPicker](../emoji-picker/emoji-picker.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorField](../color-field/color-field.md) · [Select](../select/select.md) · [Combobox](../combobox/combobox.md) · [Popover](../popover/popover.md)
