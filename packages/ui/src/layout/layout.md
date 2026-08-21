---
slug: layout
name: Layout
category: layout
group: container
tags: []
exports: [Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter]
status: enriched
---

# Layout

> 把页面拆成页头、侧栏、内容和页脚四块，侧栏可折叠 · layout/container

## 何时用

需要 Header/Sider/Content/Footer 这种通用页面骨架、且自己掌控菜单与页签逻辑时用 Layout（更原子、更自由）。若要开箱即用的中后台外壳（品牌 + NavMenu + 多页签 keep-alive 已内置），直接用 [AdminLayout](../admin-layout/admin-layout.md)，它就是基于本组件的成品装配。

## 导入
```ts
import { Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter } from "@hulianui/ui"
```

## Props

### Layout（也可用 `Layout.Sider` 等点访问）
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hasSider | `boolean` | 自动探测 | 强制横向(含侧栏)布局。缺省按直接子元素是否含 `Layout.Sider` 判定：含则横向 row，否则纵向 col。异步/条件渲染 Sider 时用它兜底。 |

继承 `HTMLAttributes<HTMLDivElement>`。

### LayoutHeader
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sticky | `boolean` | `false` | 吸顶（sticky top-0）。 |

### LayoutSider
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number` | `240` | 展开态宽度（px）。 |
| collapsedWidth | `number` | `64` | 收起态宽度（px），留出 icon-only 菜单。 |
| collapsible | `boolean` | `false` | 是否可折叠（显示底部 trigger 折叠按钮）。 |
| collapsed | `boolean` | - | 受控收起态。传入即受控，须配合 onCollapse 回写。 |
| defaultCollapsed | `boolean` | `false` | 非受控初始收起态。 |
| breakpoint | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| number` | - | 响应式断点：视口 ≤ 该宽度自动收起，> 时展开。 |

### LayoutContent / LayoutFooter
纯 `HTMLAttributes<HTMLElement>`，无专属 prop。

## Events

### LayoutSider
| 事件 | 类型 | 说明 |
|------|------|------|
| onCollapse | `(collapsed: boolean, type: "clickTrigger" \| "responsive") => void` | 收起态变化回调（点 trigger 或命中断点时触发）。 |

## Slots

### LayoutSider
| 插槽 | 类型 | 说明 |
|------|------|------|
| trigger | `ReactNode` | 底部折叠触发器内容。`undefined`=默认 chevron；`null`=不渲染触发器（即便 collapsible）；传节点=自定义触发器内容（仍由本件包裹为可点按钮）。 |

## 示例
```tsx
// 经典：左 Sider（可折叠）+ 右(Header 顶 / Content 中 / Footer 底)
<Layout>
  <Layout.Sider collapsible>
    {/* 品牌 + 菜单 */}
  </Layout.Sider>
  <Layout>
    <Layout.Header sticky>顶栏</Layout.Header>
    <Layout.Content>内容</Layout.Content>
    <Layout.Footer>底栏</Layout.Footer>
  </Layout>
</Layout>
```

```tsx
// 受控折叠：自管 collapsed，trigger/断点回写本地态后驱动菜单 mode
function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      breakpoint="md"
      onCollapse={(c) => setCollapsed(c)}
    >
      <NavMenu items={menu} mode={collapsed ? "collapsed" : "inline"} />
    </Layout.Sider>
  );
}
```

## 禁忌 / 坑

- **`Layout.Sider` 只负责宽度，不负责内容**。折叠时品牌区显示全称还是单字、`NavMenu` 走 `inline` 还是 `collapsed`，都得消费方按折叠态自己切——所以 `collapsed` 要自管 state（受控传给 Sider + `onCollapse` 回写），不能只喂一个 `defaultCollapsed` 初始值就完事。只喂初始值的话，用户点折叠后侧栏宽度确实收到 64px，内容却停在展开态，5 个中文字缩到 min-content 会一字一行竖排并把顶部撑高（#120）。折叠态也可以直接读 Sider 根节点上的 `data-collapsed` 写 CSS。
- **顶栏高度读 `--hl-layout-header-h`（4rem）**。要做「侧栏顶部 logo 区与 Header 齐平」这件几乎必做的事，两边用 `h-[var(--hl-layout-header-h)]` 即可，别去源码里翻那个数——翻错一次就是一条永远对不齐的分隔线。

- **受控/非受控二选一**：`Layout.Sider` 传了 `collapsed` 即进入受控，必须配 `onCollapse` 回写，否则 trigger/断点点了不动；只想非受控用 `defaultCollapsed`。
- **横/纵布局靠子元素探测**：嵌套子 `Layout` 是否横排取决于其直接子是否含 `Layout.Sider`。Sider 异步/条件渲染、或被包装进自定义组件（如 `<AppSider/>` 内部才渲染 `Layout.Sider`）时探测会落空，须显式给 `hasSider`。
- 收起态切窄宽用菜单的 `mode="collapsed"`（dogfood NavMenu 自带 icon-only 轨），不要手搓「窄宽裁切 label」。

## 相关
[AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
