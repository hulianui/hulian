---
slug: card-nav
name: CardNav
category: navigation
group: global
tags: [animated]
exports: [CardNav]
status: enriched
---

# CardNav

> 卡片导航 · ：胶囊顶栏汉堡点击后整条高度展开，内部卡片逐张错峰 y 位移淡入 · 受控/非受控开合 + token 卡片色(motion 去 gsap·reduced-motion) · navigation/global · #animated

## 何时用

营销站顶栏需要点开后向下展开成几张分组卡片（每张含一组链接）的导航时用。它是「展开成卡片」的一级导航；要全屏铺开错落胶囊的炫技导航用 [BubbleMenu](../bubble-menu/bubble-menu.md)，要规范多级下拉用 [NavigationMenu](../navigation-menu/navigation-menu.md)/[NavMenu](../nav-menu/nav-menu.md)，要标准应用顶栏用 [Navbar](../navbar/navbar.md)。

## 导入
```ts
import { CardNav } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | `CardNavItem[]` | — | 卡片数据，展开后渲染为一排（移动端一列），最多取前 3 张 |
| duration | `number` | `0.4` | 展开/收起动画时长（秒），reduced-motion 下自动归零 |
| open | `boolean` | — | 受控展开态，传入则由外部接管开合（配合 onOpenChange） |
| className | `string` | — | 透传根容器额外类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

> `CardNavItem`: `{ label, links?, bgColor?, textColor? }`；`links` 为 `CardNavLink[]`（`{ label, href?, ariaLabel? }`），`bgColor` 缺省吃 bg-surface，建议用 `var(--color-chart-1..5)` 做品牌色块。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCtaClick | `() => void` | CTA 按钮点击回调 |
| onOpenChange | `(open: boolean) => void` | 展开态变更回调（受控/非受控均触发） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| brand | `ReactNode` | 品牌区内容（logo/标题），居中显示在顶栏 |
| ctaLabel | `ReactNode` | 右侧 CTA 按钮文案（默认 `"Get Started"`）；传空串或 null 隐藏按钮 |

## 示例
```tsx
const items = [
  { label: "产品", bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)",
    links: [{ label: "概览", href: "#overview" }, { label: "定价", href: "#pricing" }] },
  { label: "公司", bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)",
    links: [{ label: "关于我们", href: "#about" }] },
];

// 非受控（内部管开合）
<CardNav brand="瑚琏 UI" items={items} ctaLabel="开始使用" />

// 受控
const [open, setOpen] = useState(false);
<CardNav brand="瑚琏 UI" items={items} open={open} onOpenChange={setOpen} />
```

## 禁忌 / 坑

- 受控/非受控二选一：传 `open` 即进入受控模式，必须配 `onOpenChange` 回写，否则点汉堡不会动；只想内部自管就别传 `open`。
- `items` 超过 3 张只取前 3 张（对齐原作），多的会被丢弃。
- 隐藏 CTA 用 `ctaLabel={null}` 或空串，别留默认 `"Get Started"`。
- reduced-motion 下展开动效归零但 DOM 两态一致。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
