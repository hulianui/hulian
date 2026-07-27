# @hulianui/tokens

## 0.1.2

### Patch Changes

- 549d24b: `--color-hairline` 补面向消费方的用途约束注释：该令牌**只能用于 `border-*`**。它在浅色主题的值就是 `transparent`（既定设计：靠阴影自带的发丝边分隔，避免与显式 border 形成双线），因此用作 `text-hairline` / `bg-hairline` / `fill-hairline` 时会静默隐形——不报错、不回落到继承色，元素直接看不见。填充与文字请用 `--color-border` 或 `--color-muted`。

  仅注释变更，令牌值与主题行为不变。文档站「颜色」页也已把 hairline 列入语义色表并标注该约束。

## 0.1.1

### Patch Changes

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。
