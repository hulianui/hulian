---
slug: popover
name: Popover
category: feedback
group: overlay
tags: []
exports: [Popover, PopoverTrigger, PopoverClose, PopoverContent]
status: enriched
---

# Popover

> 气泡卡片 · click 触发 + 标题/描述/Close · feedback/overlay

## 何时用

click 触发的轻量浮层，承载标题/描述/少量操作（确认、快捷设置、表单片段），点外部或 Esc 关闭。需要纯文本提示用 [Tooltip](../tooltip/tooltip.md)（hover 触发）；需要 hover 展开富内容卡片用 [HoverCard](../hover-card/hover-card.md)；需要遮罩 + 焦点锁定的强中断流程用 [Dialog](../dialog/dialog.md)。

## 导入
```ts
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "@hulianui/ui"
```

## Props

`PopoverContent`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top"｜"right"｜"bottom"｜"left"` | `"bottom"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 对齐 |
| sideOffset | `number` | `8` | 与触发器的间距 |
| anchor | `Element｜RefObject<Element>｜VirtualElement｜(() => Element｜VirtualElement｜null)` | — | 锚到别处而不是锚到 `PopoverTrigger`；传了就可以整个省掉触发器，见下 |
| plain | `boolean` | `false` | 不画皮：不渲染包住 children 的那层皮肤 div（间距 + `text-sm text-foreground`），children 直接进浮层 |
| arrow | `boolean` | `true` | 是否渲染指向触发器的箭头 |
| className | `string` | — | 额外类名 |

### plain / arrow：内容自带外观的贴边浮层

`PopoverContent` 默认把 children 包进一层 `text-sm text-foreground` 的皮肤 div，并在**有 title 或 description 时**加 `mt-2` 与其拉开距离。浮层里装的是一整块自带外观、要贴边铺满的内容（顶部搜索行 + 标签列表、`Calendar` 面板、当贴边菜单用的浮层）时，配 `className="p-0"` 加 `plain`：

```tsx
<PopoverContent plain arrow={false} align="start" className="w-auto p-0">
  <div className="flex items-center gap-2 border-b border-border p-2">
    <Search className="size-3" />
    <Input variant="cell" placeholder="搜索标签" />
  </div>
  <div className="py-1">{/* 标签列表 */}</div>
</PopoverContent>
```

`p-0` 只清得掉浮层自己的内边距，清不掉内层皮肤 div —— `className` 落在浮层上、够不着内层，所以别用 `[&>div]:mt-0` 这类任意变体选择器去压它，那等于把库内结构写成外部契约。

`arrow` 与 `plain` 是**两个独立开关**：箭头指的是浮层与触发器的关系，不是内容的皮肤。贴边菜单一般两个都关，但「无标题的纯文字提示」只需要 `plain`、「铺满型面板仍想指明来源」只需要留着箭头。

同名的 `plain` 在 [Card](../card/card.md) 的 `variant="plain"` 与 [Accordion](../accordion/accordion.md) / [Collapsible](../collapsible/collapsible.md) 的 Panel 上语义一致：**内容自带外观时，要的不是改皮肤而是没有皮肤**。

### anchor：触发点是一个坐标，不是一个元素

DOCX / canvas 上算出来的标注点、右键位置、地图上的经纬度 —— 这类「触发点」只有一个矩形，没有可以当触发器的 DOM 节点，`PopoverTrigger` 接不住。给 `anchor` 一个只需实现 `getBoundingClientRect()` 的**虚拟元素**即可，触发器整个省掉、`open` 自己控：

```tsx
const [marker, setMarker] = useState<DOMRect | null>(null);

<div onClick={(e) => setMarker(new DOMRect(e.clientX, e.clientY, 0, 0))}>{/* 预览画布 */}</div>

<Popover open={marker != null} onOpenChange={(next) => !next && setMarker(null)}>
  <PopoverContent anchor={marker && { getBoundingClientRect: () => marker }} align="start">
    {/* 标注面板 */}
  </PopoverContent>
</Popover>
```

边界翻转、视口 clamp、焦点管理、Esc 与点外部关闭、`aria-expanded` 仍然全由组件负责 —— 这正是不该自绘的部分（自绘版通常先漏掉的就是焦点与 aria）。

坐标变化时**换一个新对象**（或改用 `() => virtualEl` 的函数形态），别原地改同一个对象的字段：定位按 anchor 的 identity 变化重算，改字段不换对象浮层不会动。

同名 `anchor` 在 [HoverCard](../hover-card/hover-card.md) 上语义一致，只是那里触发器不可省（卡片是 hover 打开的）。

## Slots

`PopoverContent`：

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题 |
| description | `ReactNode` | 描述 |
| children | `ReactNode` | 正文/操作区内容 |

`PopoverTrigger` / `PopoverClose` 用 `render` prop 接管自定义触发/关闭元素（如 `render={<Button>…</Button>}`）。

## 示例
```tsx
<Popover>
  <PopoverTrigger render={<Button>打开弹层</Button>} />
  <PopoverContent side="bottom" align="center" title="确认操作" description="点击外部或 Esc 关闭。">
    <div className="flex justify-end gap-2">
      <PopoverClose render={<Button variant="ghost">取消</Button>} />
      <PopoverClose render={<Button>确定</Button>} />
    </div>
  </PopoverContent>
</Popover>
```

## 禁忌 / 坑

- 触发/关闭走 `render` prop 注入元素，别再在 `PopoverTrigger` 里二次嵌套交互元素，避免 `<button>` 套 `<button>`。
- 锚到坐标用 `anchor`，别自己 `createPortal` 手写 `left/top`：手写那条路要连边界翻转、视口 clamp、点外部关闭、Esc、焦点管理一起重造，而焦点与 `aria-expanded` 正是自绘版最常漏掉的两样。
- 浮层内容自带内边距/边框/正文色时加 `plain`（通常再配 `className="p-0"`），别用 `[&>div]:mt-0` 之类的任意变体选择器去压库内那层皮肤 div。
- 若手搓 hover 开 + focus 关叠加在这类 focus-managing popover 上会无限闪烁，见 [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]]：popover 打开时把焦点移入浮层会触发 trigger 的 onBlur 关闭，关闭又把焦点还给 trigger 触发 onFocus 打开 → ping-pong。本组件默认 click 语义不踩，但若改造成 hover 触发需把 `initialFocus`/`finalFocus` 设 false。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
