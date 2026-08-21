---
slug: scope-matrix
name: ScopeMatrix
category: forms
group: advanced
tags: []
exports: [ScopeMatrix]
status: enriched
---

# ScopeMatrix 范围矩阵

> 范围矩阵 · 允许 / 禁止两个语义对立的模式桶，并把「最终有效范围」写成人话 · forms/advanced

## 什么时候用

- 权限 / 白名单配置
- 任务或作业的可改动范围
- 路由守卫、文件同步范围、CI 触发路径

## 什么时候不用

| 场景 | 用什么 | 为什么 |
|---|---|---|
| 从固定候选池搬运 | `Transfer` | 候选是封闭集合，用户只能选不能造 |
| 自由输入的一维标签 | `TagInput` | 没有「两个对立的桶」这层语义 |

## 用法

```tsx
import { ScopeMatrix } from "@hulianui/ui";

const [scope, setScope] = useState({ allow: ["src/**"], deny: ["**/dist/**"] });

<ScopeMatrix
  allow={scope.allow}
  deny={scope.deny}
  onChange={setScope}
  suggestions={derivedFromProject}
/>
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `allow` | `string[]` | - | 允许列表；空数组 = 不启用白名单 |
| `deny` | `string[]` | - | 禁止列表 |
| `onChange` | `(next: { allow, deny }) => void` | - | 不给则为只读 |
| `suggestions` | `string[]` | `[]` | 候选模式，点击填入输入框 |
| `readOnly` | `boolean` | `false` | 强制只读 |
| `validate` | `(pattern) => string \| null` | - | 返回错误文案表示非法 |
| `allowLabel` / `denyLabel` | `ReactNode` | `"允许"` / `"禁止"` | 桶标题 |
| `allowHint` / `denyHint` | `ReactNode` | 见默认值 | 桶下方说明 |
| `placeholder` | `string` | `"输入模式后回车"` | 输入占位符 |

## 设计取舍

**底部小结是这个组件存在的主要理由。** 允许/禁止两个列表谁都会做，但这类配置有两个极易想错的点：

1. **禁止优先于允许** —— 同时命中时以禁止为准。
2. **允许为空 ≠ 全部禁止** —— 而是「不启用白名单」，只受禁止列表约束。

第 2 条写反的后果是配好之后一切都被拦，用户会以为工具坏了。与其指望人读文档，不如让界面随时把当前配置的实际效果写成一句话。

**不内置模式语法校验。** glob / 正则 / ant 风格 / 自定义 DSL 差异很大，组件猜错比不猜更糟。需要校验就传 `validate`。

**候选点击只填入不提交。** 候选往往需要在填入后微调（改个层级、加个后缀），直接提交会逼用户先加后删。
