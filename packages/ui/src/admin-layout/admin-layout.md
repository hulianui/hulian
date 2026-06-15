---
slug: admin-layout
name: AdminLayout
category: layout
group: container
tags: []
exports: [AdminLayout]
status: enriched
---

# AdminLayout

> 中后台骨架 · 侧栏(品牌+NavMenu可折叠) + 顶栏(折叠/面包屑/扩展区) + 多页签导航(开/切/关·关闭其他/全部·受控接路由或菜单点击自动维护) + 内容区(复用 NavMenu/ScrollArea/Popover·企业应用外壳) · layout/container

## 何时用

要快速搭一个完整中后台外壳——侧栏菜单 + 顶栏 + 多页签 keep-alive 导航开箱即用——用 AdminLayout，只需喂 `menuItems` 和 `children`。若想自己掌控每一块布局（不要内置页签逻辑、要更原子的拼装），下沉到 [Layout](../layout/layout.md)。

## 导入
```ts
import { AdminLayout } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| menuItems* | `NavMenuNode[]` | — | 侧边菜单数据（复用 NavMenu）。 |
| selectedKey | `string` | — | 受控菜单选中 key。 |
| defaultSelectedKey | `string` | — | 非受控初始选中 key。 |
| openKeys | `string[]` | — | 受控展开的子菜单 key。 |
| defaultOpenKeys | `string[]` | — | 非受控初始展开。 |
| collapsed | `boolean` | — | 受控侧栏折叠态。 |
| defaultCollapsed | `boolean` | — | 非受控初始折叠态。 |
| showTabs | `boolean` | `true` | 是否显示多页签条。 |
| tabs | `AdminTab[]` | — | 受控页签列表；不传则由菜单点击自动维护（非受控）。 |
| activeKey | `string` | — | 受控当前激活页签 key。 |
| defaultActiveKey | `string` | — | 非受控初始激活页签（亦决定首屏自动打开的页签）。 |
| fitViewport | `boolean` | `true` | 是否自占满视口高度。整页应用骨架保持 true（固定 100dvh、内容区内部滚动）；嵌入有固定高度的容器预览时置 false，改用 `h-full` 跟随父容器。 |
| className | `string` | — | 根容器类名。 |
| contentClassName | `string` | — | 内容区类名。 |

`AdminTab`：`{ key: string; label: ReactNode; closable?: boolean }`，`closable` 缺省为「打开页签 >1 时可关，最后一个不可关」。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onMenuSelect | `(key: string, item: NavMenuItem) => void` | 点击菜单叶子项触发。 |
| onOpenChange | `(openKeys: string[]) => void` | 子菜单展开变化回调。 |
| onCollapsedChange | `(collapsed: boolean) => void` | 侧栏折叠变化回调。 |
| onTabChange | `(key: string) => void` | 切换页签回调。 |
| onTabClose | `(key: string) => void` | 关闭页签回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 主内容（当前激活页内容，由上层按 activeKey 决定）。 |
| logo | `ReactNode` | 品牌区（展开态）。 |
| logoCollapsed | `ReactNode` | 品牌区（收起态，默认复用 logo）。 |
| breadcrumb | `ReactNode` | 顶栏面包屑区。 |
| headerExtra | `ReactNode` | 顶栏右侧扩展区（用户菜单 / 通知 / 主题切换等）。 |

## 示例
```tsx
const [active, setActive] = useState("dashboard");

<AdminLayout
  menuItems={menu}
  logo={<span className="font-bold text-primary">瑚琏 Admin</span>}
  logoCollapsed={<span className="font-bold text-primary">瑚</span>}
  defaultActiveKey="dashboard"
  defaultSelectedKey="dashboard"
  defaultOpenKeys={["users"]}
  onTabChange={setActive}
  breadcrumb={<span className="text-sm text-muted">首页 / {active}</span>}
  headerExtra={<Avatar fallback="瑚" />}
>
  <Page k={active} />
</AdminLayout>
```

## 禁忌 / 坑

- **`fitViewport` 决定撑高方式**：整页用默认 `true`（自钉 100dvh），别再外面套 `h-dvh` wrapper；嵌入文档示例卡等固定高度容器时务必传 `false`，否则整页滚动而非内容区滚动。详见 [[hulian-adminlayout-fitviewport]]。
- **页签受控/非受控二选一**：不传 `tabs` 时页签由菜单点击自动维护（非受控）；一旦传 `tabs` 即受控，须自行配 `onTabChange`/`onTabClose` 维护数组与 `activeKey`。
- `children` 只渲染「当前激活页」，keep-alive 的多页内容缓存需上层按 `activeKey` 自行管理，组件不替你缓存各页 DOM。

## 相关
[Layout](../layout/layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
