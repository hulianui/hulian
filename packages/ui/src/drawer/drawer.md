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
| `DrawerContent.title` | `ReactNode` | — | 提供则渲 Dialog.Title 作 a11y label |
| `DrawerContent.description` | `ReactNode` | — | 说明文案 |
| `DrawerContent.footer` | `ReactNode` | — | 钉底操作区（带分隔线，正文独立滚动，footer 始终可见） |
| `DrawerContent.container` | `Element \| Ref` | — | 就地挂载目标；提供后 portal 进该容器并改用 absolute 贴其边（容器须 `position:relative` + `overflow-hidden`），用于手机框预览等局部容器 |
| `DrawerContent.children` | `ReactNode` | — | 正文内容 |
| `DrawerContent.className` | `string` | — | 内容容器类名 |

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

- Base UI rc.0 没有独立 Drawer 原语，本组件是 Dialog（Portal+Backdrop+Popup）重皮、靠 `transform: translateX/Y` 按 `side` 侧滑；Dialog 没有 Positioner，定位别按 Tooltip/Popover 那套想。详见 [[base-ui-dialog-drawer-side-slide-via-transform]]。
- 「取消 / 保存 / 关闭」放 `footer` 槽而非正文末尾，否则正文滚动后按钮会滚出可视区。
- 用 `container` 收进局部容器（如手机框）时，容器必须 `position:relative` + `overflow-hidden`，否则抽屉会逃逸出框、遮罩盖满整屏。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
