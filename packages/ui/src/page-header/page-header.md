---
slug: page-header
name: PageHeader
category: navigation
group: inpage
tags: []
exports: [PageHeader]
status: enriched
---

# PageHeader

> 页头骨架 · 返回/面包屑/标题/标签/操作区/Tabs 页脚(dogfood 复用·零依赖) · navigation/inpage

## 何时用

详情页 / 管理页顶部的页头骨架：统一安放返回箭头、面包屑、主标题、状态标签、右侧操作区和底部 Tabs。各槽位直接 dogfood 传入瑚琏 [Breadcrumb](../breadcrumb/breadcrumb.md) / Chip / [Tabs](../tabs/tabs.md)；只需要面包屑导航本身用 Breadcrumb，PageHeader 是把整块页头排版好。

## 导入
```ts
import { PageHeader } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| backLabel | `string` | `"返回"` | 返回按钮的无障碍标签。 |
| bordered | `boolean` | `false` | 是否在页头底部渲染分隔线（复用 `<Separator/>`）。 |
| metaSeparator | `ReactNode` | `"·"` | `meta` 各项之间的分隔符，装饰位自动 `aria-hidden`。 |
| titleAs | `ElementType` | `"h1"` | 标题渲染成哪个标签。层级归页面决定；**只让出标签，字号不跟着标签变**（恒为 20px/28px）。 |

> 另继承 `HTMLAttributes<HTMLElement>`（除 `title`，因其类型被改为 ReactNode）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onBack | `() => void` | 提供则在标题左侧渲染返回箭头按钮，点击触发该回调（带回调 → 消费侧为 client）。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 主标题。 |
| subTitle | `ReactNode` | 副标题，内联于标题右侧，中性弱化色。 |
| breadcrumb | `ReactNode` | 面包屑区（标题行上方），传入瑚琏 `<Breadcrumb/>`。 |
| tags | `ReactNode` | 状态标签区（贴标题右侧），传入 `<Chip/>`/`<Badge/>` 等。 |
| meta | `ReactNode[]` | 元信息行：标题下面那串用 `metaSeparator` 串起来的事实值。分隔符由组件插在项与项之间，空项自动跳过。 |
| extra | `ReactNode` | 右侧操作区（按钮组等），**窄屏**（视口 < 640px）自动换行到标题下方；宽屏下标题再长也不换行，长标题该截断就截断。 |
| footer | `ReactNode` | 底部附加区，常放 `<Tabs/>`。 |

## 示例
```tsx
// 极简：仅标题 + 操作
<PageHeader title="用户管理" extra={<Button variant="solid" size="sm">新建用户</Button>} />

// 完整页头
<PageHeader
  onBack={() => router.back()}
  breadcrumb={<Breadcrumb items={[{ label: "首页", href: "/" }, { label: "订单详情" }]} />}
  title="订单 #20260603-8821"
  subTitle="共 6 件商品"
  tags={<Chip tone="brand" variant="soft" size="sm">进行中</Chip>}
  extra={<Button variant="solid" size="sm">编辑</Button>}
  footer={<Tabs defaultValue="detail"><TabsList><TabsTab value="detail">详情</TabsTab></TabsList></Tabs>}
  bordered
/>
```

标题标签交给页面（页头不是本页最高级标题、或标题本身是个动画组件时）：
```tsx
// 这一屏的 h1 在别处 → 页头降为 h2；标题组件自己是那个标签的话，用 titleAs 传它
<PageHeader titleAs="h2" title="张三" />

// 标题带动画：动画组件降成 span 嵌在标签里，标签由 titleAs 决定
<PageHeader titleAs="h2" title={<AnimatedTitle as="span">张三</AnimatedTitle>} />
```

元信息行（证件号 · 性别 · 参保段数…）：
```tsx
<PageHeader
  title="张三"
  meta={[
    "330106…512",
    "男",
    socialSecuritySegments && `${socialSecuritySegments} 段社保`, // 无值时整项消失，不留下孤点
    companyCount ? `${companyCount} 家公司` : null,
    latestEmployer && `最近参保单位：${latestEmployer}`,
  ]}
/>
```

## 禁忌 / 坑

- `meta` 是**一串并列的事实值**，别拿它当别的槽用：一句话说明用 `subTitle`，状态标记用 `tags`，Tabs 之类的整块内容用 `footer`。
- `meta` 里的空项（`null` / `undefined` / `false` / `""`）自动跳过，分隔符只插在留下来的项之间，所以不必在调用点先 `filter(Boolean)`。数字 `0` 是事实值（「0 家公司」），不算空。
- 元信息行渲染为 `<ul>`/`<li>`，分隔符是独立的 `aria-hidden` 装饰位——读屏读到的是列表项而不是被中点粘住的长串文本。别再用 `span + span::before { content: "·" }` 自己拼点。
- 从 `span + span::before { content: "·" }` 迁过来时**要逐项核对，不能照搬**：那条选择器的真实语义是「**渲染出来的相邻 `<span>` 之间**才插点」，所以那一行里混了按钮 / 图标 / 链接（渲染成 `<button>` / `<svg>` / `<a>`）的位置，现网**本来就没有点**。而 `meta` 的「一项」是**数组项**，不看它渲染成什么标签，一律在项与项之间插分隔符。把 `[证件号, <CopyButton/>]` 这类混排原样搬过来，会凭空多出一个分隔符——这是真实的视觉回归，不是本组件的 bug（hulianui/hulian#247）。
- **`extra` 换行看视口，不看标题长度**（#263）。左列是 `flex: 1 1 0`，宽屏下标题再长也不会把操作区挤到第二行；视口 < 640px 才让位换行。同源问题在 [Card](../card/card.md) 的 `CardHeader` 上先暴露：那边卡片宽度由布局决定、与视口无关，所以连这一档窄屏换行都没有。
- `titleAs` 只让出标签，不让出字号：换成 `h2` 之后字号仍是 20px/28px。要改字号在 `className` 上用后代选择器（`className` 落在外层 `<header>`），别在 `title` 里再套一层子元素用工具类把父元素的字号顶掉——那是一个标题上两条打架的字号声明。
- `title` 为 ReactNode，与 `HTMLAttributes.title?: string` 冲突，类型已 `Omit<"title">`——别再往 DOM 透传字符串 title。
- 默认返回标签跟随 `ConfigProvider`，`backLabel` 显式覆盖；组件因此是 client 组件，服务端组件仍可导入并渲染它。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
