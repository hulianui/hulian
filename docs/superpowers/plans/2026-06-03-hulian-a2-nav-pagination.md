# 瑚琏 Hulian A2 导航族补充 — Pagination 分页器（plan）

- **日期**: 2026-06-03
- **类型**: A2 导航族增量（无独立 spec；主 batch design §3.4 navigation 分组扩一件，沿用 Breadcrumb「纯皮肤小件 · brainstorm 裁决直接固化在 plan/commit」先例）
- **承载 Table 当初 YAGNI 推迟的分页**：Table 选 headless（TanStack），分页/筛选/列宽全推迟为「原生 row model 增量接」。Pagination 作**独立纯皮肤组件**补上，外部接 TanStack `getPaginationRowModel` 或自管页码皆可——分页器不管数据，只受控吃 `page/total` 出页码 UI。

## 1. brainstorm 裁决（已锁定）

| 决策点 | 裁决 | 理由 |
|--------|------|------|
| 核心算法 | **独立纯函数 `getPaginationRange({page,total,siblingCount})`**（零 React/零副作用，单测重点） | 区间逻辑是命脉，必须可纯测边界 |
| 区间规则 | 首页(1) + 末页(total) + 当前页±siblingCount，升序去重；**相邻两段间隔 >1 页才插省略号**，恰隔 1 页则直接补出那一页 | 用户口径「两段间隔 >1 才省略」；恰隔 1 页插「…」反而比直接显示数字更费——补出更优（同 MUI usePagination 的 single-gap fill） |
| 省略号表示 | sentinel `"ellipsis"`（`PaginationItem = number \| "ellipsis"`） | 类型安全，渲染层判分支 |
| 受控 API | **受控 only**：`page` + `onPageChange(page)` 必填（家风同 Tabs/Slider 受控透传） | 消费者已持页码态（拉数据要用），内部 useState 非受控 = YAGNI |
| `"use client"` | **本体必加**（含 onClick 交互回调）——区别于纯链接的 Breadcrumb | 事件处理器不能跨 RSC 序列化；纯函数 `pagination.range.ts` 不带 React → RSC 安全 + 独立单测 |
| 按钮气质 | 页码/上下页**复用 Button 组件**（variant 当前页=`solid`、其余=`ghost`；prev/next=`ghost`+chevron），覆写为定方形 `h-9 min-w-9 px-1.5` | 直接继承 focus-ring/disabled/press，零重写「复用 Button 气质」 |
| 省略号交互 | **不可跳**（装饰 `<span aria-hidden>…</span>` + sr-only「更多页面」） | click-to-jump = YAGNI；多数设计系统省略号不可点 |
| siblingCount | prop，默认 1；不暴露 boundaryCount（首尾恒各 1，YAGNI） | 用户只提 siblingCount |
| showFirstLast | 可选 prop，默认 false → 显「跳到首页/末页」chevrons-left/right，边界 disabled | 用户列为可选 |
| 几何禁区 | 不写死整体宽度；页码用 `min-w-9` 让多位数自然增长，仅高度定 `h-9` | 100+ 页三位数不溢出 |

## 2. 文件（四件套 + 独立纯函数模块）

```
packages/ui/src/pagination/
  pagination.range.ts        # 纯函数 getPaginationRange + PaginationItem 类型（无 React）
  pagination.range.test.ts   # 纯函数单测（TDD 重点：边界）
  pagination.types.ts        # PaginationProps
  pagination.tsx             # "use client" 组件（复用 Button）
  pagination.test.tsx        # 组件交互/a11y 测试
  pagination.showcase.tsx    # "use client" showcase（内部 Demo 管页码态）
  index.ts                   # 桶导出
```

- 主 barrel `packages/ui/src/index.ts` + `export * from "./pagination"`。
- IA 接入：`apps/www/lib/manifest.ts` + 1 行（navigation/new）、`registry.tsx` import + map 各 +1（**幂等 python 读改写插入**，检测 slug 已存在则跳过，缩并发竞争窗口）。

## 3. 纯函数单测边界（TDD 重点）

1. total 很小全显示不省略：`total=5,page=3` → `[1,2,3,4,5]`
2. 当前在头：`total=10,page=1` → `[1,2,"ellipsis",10]`
3. 当前在尾：`total=10,page=10` → `[1,"ellipsis",9,10]`
4. 两侧都省略：`total=10,page=5` → `[1,"ellipsis",4,5,6,"ellipsis",10]`
5. 单页间隔补出（不插省略号）：`total=7,page=4` → `[1,2,3,4,5,6,7]`（全补满）
6. 不对称（左补单页/右省略）：`total=8,page=4` → `[1,2,3,4,5,"ellipsis",8]`
7. siblingCount=2：`total=15,page=8,sibling=2` → `[1,"ellipsis",6,7,8,9,10,"ellipsis",15]`
8. total=1 → `[1]`；total=0 → `[]`
9. page 越界夹紧：`page=999,total=10` 等价 `page=10`
10. 结果升序无重复、首=1 尾=total（total≥1）

## 4. 组件测试

- nav + aria-label="pagination"
- 渲染页码按钮；当前页 `aria-current="page"`、variant solid
- 点页码 → `onPageChange(n)`；点 prev/next → `onPageChange(current∓1)`
- 边界：page=1 prev `disabled`；page=total next `disabled`
- 省略号 = aria-hidden 非 button
- `showFirstLast` 渲首末按钮、边界 disabled、点击跳 1/total
- `disabled` 整体禁用
- `siblingCount` 透传影响渲染页码数

## 5. 门禁 + 截图

- 三道门 `--force`（自己 vitest + typecheck + `build --filter=www --force`，别信 turbo cache）。
- 截图：dev server 在 **5512**（5514 桌面 app 实例当前停）→ 打 5512；MCP 浏览器被占则自起隔离 chromium（`executablePath` 指 ms-playwright 缓存 + `addInitScript` 预置 `localStorage hulian-theme`），轮询 hydration 后 captureScreenshot，明暗两态存 cwd 根 Read 看像素：验当前页高亮 / 省略号位置 / 边界 disabled / 页码方块对齐。
- 并发：精确 `git add <路径>` + `git commit -- <pathspec>`（race-safe），isolate 他人 untracked WIP（chart/README/截图）不碰。

## 6. 收尾

finishing → 更新项目记忆 `hulian-phase-status`（+Pagination，navigation 第 N 件）→ claudeception 评估（页码省略号区间算法 single-gap-fill 可能产新 skill）。
