---
slug: access
name: Access
category: uncatalogued
group: 
tags: []
exports: [Access]
status: enriched
---

# Access

> 声明式权限门禁：有权限渲染 children，否则渲染 fallback（默认隐藏）。 · uncatalogued

## 何时用

按钮 / 菜单项 / 区块按当前用户权限条件渲染时用它包一层，避免散落的 `hasPermission && <X/>` 判断。须先在外层挂 `AccessProvider` 注入权限集合；命令式判定（如 `if`/useEffect 里）用 `useAccess()` hook 而非本组件。

## 导入
```ts
import { Access } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| permission | `string ｜ string[]` | — | 需要的权限；与 accessible 二选一，accessible 优先 |
| mode | `"all" ｜ "any"` | `"all"` | 数组权限匹配模式：all=全部具备 / any=任一具备（单字符串无效） |
| accessible | `boolean ｜ ((access: AccessContextValue) => boolean)` | — | 自定义判定（优先于 permission） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 有权限时渲染的内容 |
| fallback | `ReactNode` | 无权限时渲染的内容（默认 `null`，即隐藏） |

> 须配套 `<AccessProvider permissions={...}>`（`permissions` 接 `string[]` 或 `Set`）在外层注入权限集合；持有 `"*"` 通配符视为超管放行任意检查。

## 示例
```tsx
// 应用最外层注入权限集合（登录后拿到）
<AccessProvider permissions={["user:read", "user:delete"]}>
  <App />
</AccessProvider>

// 业务里条件渲染
<Access permission="user:delete" fallback={<Tooltip>无权限</Tooltip>}>
  <Button tone="danger">删除</Button>
</Access>

// 多权限任一即可
<Access permission={["order:export", "order:admin"]} mode="any">
  <Button>导出</Button>
</Access>
```

## 禁忌 / 坑

- 判定优先级 `accessible > permission > 无约束(恒放行)`：三者都不传时**恒放行**，别误以为无 permission 会拦截。
- 必须在 `AccessProvider` 子树内使用，否则 `useAccess()` 拿不到权限集合。
- 前端门禁只是 UX 兜底，**不是安全边界**——后端接口须独立鉴权，别把隐藏当授权。

## 相关
—
