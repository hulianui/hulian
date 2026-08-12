---
slug: drawer
name: Drawer
category: feedback
group: overlay
tags: []
exports: [Drawer, DrawerTrigger, DrawerClose, DrawerContent, drawerVariants]
status: enriched
---

# Drawer

> 抽屉 · Base UI Dialog 引擎 + 四向侧滑 · feedback/overlay

## 何时用

需要从屏幕某一边滑入的面板（筛选器、详情、表单、移动端菜单）时用，正文可独立滚动、操作按钮钉底。居中弹出的对话框用 [Dialog](../dialog/dialog.md)；强制决策用 [AlertDialog](../alert-dialog/alert-dialog.md)；锚定小浮层用 [Popover](../popover/popover.md)。

## 导入
```ts
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, drawerVariants } from "@hulianui/ui"
```

## Props

`Drawer` 透传 Base UI Dialog Root（`open`/`defaultOpen`/`onOpenChange` 等）；`DrawerTrigger`/`DrawerClose` 支持 `render` 接管元素。`DrawerContent` 为瑚琏皮肤：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `DrawerContent.side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | 贴边方向 + 对应滑入方向 |
| `DrawerContent.size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | 主轴尺寸档。**主轴随 `side` 换手**：左右抽屉吃宽度、上下抽屉吃高度，故同一档在两轴上不是同一个值（见下表）。交叉轴恒 100%，不随此档变 |
| `DrawerContent.container` | `Element \| Ref` | — | 就地挂载目标；提供后 portal 进该容器并改用 absolute 贴其边（容器须 `position:relative` + `overflow-hidden`），用于手机框预览等局部容器 |
| `DrawerContent.showClose` | `boolean` | `true` | 是否渲染右上角内置关闭按钮 |
| `DrawerContent.closeLabel` | `string` | 取自 locale | 内置关闭按钮的无障碍名（默认取 `locale.drawer.close`） |
| `DrawerContent.descriptionClassName` | `string` | — | 追加到说明文案（走 twMerge）。传 `sr-only` 即「只给读屏的说明」 |
| `DrawerContent.backdrop` | `boolean` | `true` | 是否渲染遮罩。`false` + Root 的 `modal={false}` 才是真正的非模态（只关一边不成立：遮罩那层 `inset-0` 即使透明也吃掉整屏点击） |
| `DrawerContent.backdropClassName` | `string` | — | 追加到遮罩（默认 `bg-black/40 backdrop-blur-sm`），走 twMerge，可调浓度/模糊 |
| `DrawerContent.scrollable` | `boolean` | `true` | 正文区是否自带纵向滚动。`false` 时正文变成列向 flex 容器，把确定高度传给 children |
| `DrawerContent.bodyClassName` | `string` | — | 追加到正文区容器 |
| `DrawerContent.className` | `string` | — | 内容容器类名 |

### 尺寸档对照

| size | `left` / `right` 宽 | `top` / `bottom` 高 |
|------|------|------|
| `sm` | 20rem (320px) | 16rem (256px) |
| `md`（默认） | 24rem (384px) | 20rem (320px) |
| `lg` | 32rem (512px) | 32rem (512px) |
| `xl` | 48rem (768px) | 48rem (768px) |
| `full` | 100% | 100% |

除 `full` 外都带 `min(90vw, …)` / `min(90vh, …)` 上限：抽屉是贴边的，宽过视口的那截会直接落到屏幕外够不着，不是"挤一点"而已。`md` 就是 0.39.0 及之前写死的那两个值，不传 `size` 的既有代码渲染不变。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `Drawer.onOpenChange` | `(open: boolean) => void` | 开关态变化回调（透传 Base UI Dialog Root） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `DrawerContent.title` | `ReactNode` | 提供则渲 Dialog.Title 作 a11y label |
| `DrawerContent.description` | `ReactNode` | 说明文案 |
| `DrawerContent.footer` | `ReactNode` | 钉底操作区（带分隔线，正文独立滚动，footer 始终可见） |
| `DrawerContent.children` | `ReactNode` | 正文内容 |

## 示例
```tsx
<Drawer>
  <DrawerTrigger render={<Button variant="outline">打开抽屉</Button>} />
  <DrawerContent
    side="right"
    title="设置面板"
    description="Esc / 点遮罩 / 关闭按钮均可收起；焦点锁在抽屉内。"
    footer={
      <>
        <DrawerClose render={<Button variant="outline">取消</Button>} />
        <DrawerClose render={<Button>保存</Button>} />
      </>
    }
  >
    {/* 长正文自动滚动，footer 钉底 */}
  </DrawerContent>
</Drawer>
```

## 禁忌 / 坑

- 非模态浮层要**两处一起改**：Root 传 `modal={false}`（让焦点与滚动锁失效）+ Content 传 `backdrop={false}`（不渲染遮罩）。只改前者时那层 `fixed inset-0` 仍在，透明也照样吃掉整屏点击，"非模态"等于没生效。
- `scrollable={false}` 之后**纵向滚动归你自己**：正文区只负责把确定高度传下去（列向 flex），子级要自己写 `overflow-y-auto`。忘了写就是整块内容被 `max-h` 裁掉。

- Base UI rc.0 没有独立 Drawer 原语，本组件是 Dialog（Portal+Backdrop+Popup）重皮、靠 `transform: translateX/Y` 按 `side` 侧滑；Dialog 没有 Positioner，定位别按 Tooltip/Popover 那套想。详见 [[base-ui-dialog-drawer-side-slide-via-transform]]。
- 「取消 / 保存 / 关闭」放 `footer` 槽而非正文末尾，否则正文滚动后按钮会滚出可视区。
- 用 `container` 收进局部容器（如手机框）时，容器必须 `position:relative` + `overflow-hidden`，否则抽屉会逃逸出框、遮罩盖满整屏。

### 尺寸该用 `size` 还是 `className`

先用 `size`。`className` 里压 `w-` / `h-` 也能改出来，但那要连同 `inset-x-` / `w-full` 一起顶（组件刚给的东西又撤一遍），而且失去了 `min(90vw, …)` 上限保护——窄屏上抽屉会宽过视口，超出的那截落在屏幕外，里面的控件彻底够不着。`size` 五档不够用（比如要按容器百分比）时再用 `className`，此时**必须自己补一条上限**，例如 `className="w-[min(90vw,52rem)]"`。

### 「浮起式」底部抽屉（左右留白 + 圆角）需要自己写

组件目前只有贴边一种形态。移动端常见的"离边框还有一圈留白、四角带圆角"的浮起式 sheet 得靠 `className`，且**必须连出场位移一起改**——面板一旦离开屏幕边缘 16px，原来的 `translate-y-full` 就送不出屏幕了，收起时底部会留一道 16px 的残影：

```tsx
<DrawerContent
  side="bottom"
  size="lg"
  className="inset-x-4 bottom-4 w-auto rounded-[var(--radius)] border
             data-[starting-style]:translate-y-[calc(100%+1rem)]
             data-[ending-style]:translate-y-[calc(100%+1rem)]"
/>
```

### 关闭按钮

`DrawerContent` 默认渲染右上角关闭按钮（`showClose`，无障碍名走 `closeLabel` 或 locale 的 `drawer.close`）。
纯展示型抽屉（导航菜单、详情面板，没有 footer 的那种）此前唯一的可见退路只有点遮罩，键盘用户只剩 Esc，
读屏用户在面板里根本找不到「关闭」（hulianui/hulian#63）。按钮绝对定位，不占布局。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
