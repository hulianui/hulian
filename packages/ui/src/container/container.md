---
slug: container
name: Container
category: layout
group: container
tags: []
exports: [Container]
status: enriched
---

# Container

> 内容容器 · 限制最大宽度(sm/md/lg/xl/full) + 居中 + 左右安全内距 + as 多态(收口全站 mx-auto max-w-Nxl px-6 样板·零依赖·RSC) · layout/container

## 何时用

页面/区块需要限制内容最大宽度并水平居中、留出左右安全内距时用 Container——收口全站重复的 `mx-auto max-w-Nxl px-6` 样板。它只管宽度约束与居中，不排列子项；子项的方向/间距交给 [Layout](../layout/layout.md) 或 Stack。需要整页骨架（侧栏+顶栏+多页签）用 [AdminLayout](../admin-layout/admin-layout.md)。

## 导入
```ts
import { Container } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"xl"` | 最大宽度档：sm=2xl / md=3xl / lg=4xl / xl=5xl / full=不限 |
| padded | `boolean` | `true` | 是否水平居中并加左右安全内距 |
| as | `ElementType` | `"div"` | 渲染标签（语义/布局解耦，如 section/main/article） |
| children | `ReactNode` | — | 子内容 |

其余 `HTMLAttributes<HTMLElement>` 属性（className/style 等）透传。

## 示例
```tsx
// 各档最大宽度
<Container size="lg">
  <Box>内容限制在 4xl 宽度内并居中</Box>
</Container>

// 用语义标签承载
<Container as="main" size="xl">
  {children}
</Container>
```

## 禁忌 / 坑

暂无已知坑。`size` 档位映射的是 Tailwind `max-w-*`（sm=2xl 而非 sm），勿按字面理解。候选坑列表（affix/dialog-portal/dnd-kit/flex-mx-auto/recharts/scrollspy/sticky-glass/vant-toast）均为各自具体场景的容器问题，与本通用宽度容器无直接关系，已剔除。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
