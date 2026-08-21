---
slug: tour
name: Tour
category: feedback
group: guide
tags: []
exports: [Tour, resolveTarget, computeSpotlight, computeCardPosition, type Rect]
status: enriched
---

# Tour

> 带用户走一遍功能引导，高亮目标并逐步说明 · feedback/guide

## 何时用

新手引导 / 功能上线导览：逐步高亮页面上的真实 DOM 元素并附气泡讲解。需要「逐步串联多个页面元素」用本组件；只是悬停/点击单个元素的提示用 [Tooltip](../tooltip/tooltip.md) / [Popover](../popover/popover.md)；阻断式确认流程用 [Dialog](../dialog/dialog.md) / [Modal](../modal/modal.md)。

## 导入
```ts
import { Tour, resolveTarget, computeSpotlight, computeCardPosition, type Rect } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| steps* | `TourStep[]` | - | 引导步骤列表（见下） |
| open* | `boolean` | - | 是否打开（受控） |
| current* | `number` | - | 当前步索引（受控，从 0 起） |
| maskClosable | `boolean` | `false` | 点击遮罩是否关闭（默认不允许误触关闭） |
| spotlightPadding | `number` | `8` | 高亮镂空在目标四周的留白 px |
| spotlightRadius | `number` | `8` | 镂空圆角 px |
| gap | `number` | `12` | 气泡卡与目标的间距 px |
| zIndex | `number` | `100` | 遮罩 z-index |

**TourStep**：
| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| target | `(() => Element \| null) \| string \| null` | - | 高亮目标：函数（`() => ref.current`，DOM 动态时最稳）/ CSS 选择器字符串 / null 省略（气泡居中，适合开场收尾） |
| title | `ReactNode` | - | 步骤标题 |
| description | `ReactNode` | - | 步骤描述 |
| placement | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | 气泡方位（放不下自动翻到对侧）；无目标时忽略 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(current: number) => void` | 当前步变化（点上一步/下一步） |
| onClose | `() => void` | 关闭（跳过/Esc/末步完成且未传 onFinish） |
| onFinish | `() => void` | 末步「完成」回调；不传则走 onClose |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| prevText | `ReactNode` | 「上一步」按钮文案覆盖；默认跟随 `ConfigProvider` locale |
| nextText | `ReactNode` | 「下一步」按钮文案覆盖；默认跟随 `ConfigProvider` locale |
| skipText | `ReactNode` | 「跳过」按钮文案覆盖；默认跟随 `ConfigProvider` locale |
| finishText | `ReactNode` | 「完成」按钮文案覆盖；默认跟随 `ConfigProvider` locale |

> TourStep 内的 `title` / `description` 亦为 `ReactNode`，见上方 TourStep 表。

## 示例
```tsx
const [open, setOpen] = useState(false);
const [current, setCurrent] = useState(0);

<Tour
  open={open}
  current={current}
  onChange={setCurrent}
  onClose={() => setOpen(false)}
  steps={[
    { title: "欢迎", description: "开场居中…" },
    { target: () => searchRef.current, title: "全局搜索", description: "…", placement: "bottom" },
    { target: "#new-btn", title: "新建一条", description: "…", placement: "left" },
  ]}
/>
```

## 禁忌 / 坑

- 导航、关闭、对话框和进度标签跟随最近的 `ConfigProvider` locale；未提供 Provider 时默认中文，显式文案 props 优先。
- 完全受控：`open` 与 `current` 必须由消费者 state 持有，上一步/下一步只触发 `onChange`，本组件不自管步索引——忘记在 `onChange` 里回写 `current` 会导致引导卡在第一步。
- `target` 用函数（`() => ref.current`）比 CSS 选择器更稳，尤其目标 DOM 动态挂载/卸载时。
- 全屏 overlay 经 Portal 挂到 body；截图/可视验证须「先点开始触发 open 再截」（同 Drawer/Popover/Toast）。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
