---
"@hulianui/ui": patch
---

npm 包页面的 README 组件数同步到 394，并把包 README 纳入计数门禁

`packages/ui/README.md`（即 npm 上 `@hulianui/ui` 页面显示的那份）自 0.27.0 写下「383 个组件」后再没动过，
而仓库根 README 早已是 394：`pnpm readme:sync` 与 CI 计数门禁此前只覆盖根目录两份 README，包内这份既不同步也不校验，
于是出现「GitHub 显示 394、npm 显示 383、CI 全绿」。现在三份 README 走同一份口径与同一条门禁，包 README 滞后会当场红。
