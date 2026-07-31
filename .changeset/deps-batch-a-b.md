---
"@hulianui/ui": patch
"@hulianui/tokens": patch
"@hulianui/mocks": patch
---

依赖升级：semver range 内的安全批次 + 组件依赖 minor

**安全批**（patch / 小 minor，行为无预期变化）：
react `19.2.7→19.2.8`、tailwindcss `4.3.0→4.3.3`、@tanstack/react-virtual `3.14.2→3.14.9`、
react-colorful `5.7.0→5.8.0`、@types/react `19.2.16→19.2.18`、@types/react-dom `19.2.3→19.2.4`，
以及仓库侧的 next `16.2.6→16.2.12`、@next/mdx、@tailwindcss/postcss、turbo `2.9.16→2.10.8`、
@changesets/cli、msw、@faker-js/faker、@mui/material-nextjs、@tauri-apps/*。

**组件依赖批**（minor，但都是运行时行为依赖，已跑全量测试）：
@base-ui/react `1.5.0→1.6.0`、@mui/material `9.0.1→9.2.0`、@mui/x-date-pickers `9.3.0→9.10.1`、
recharts `3.8.1→3.10.1`、motion `12.40.0→12.43.0`、lucide-react `1.17.0→1.28.0`。

**顺带修掉一处版本裂开**：tiptap 的直接依赖此前锁在 3.25.0，而它的传递依赖
（`@tiptap/extension-bubble-menu` / `extension-floating-menu` / `extensions`）已被解析到 3.29.x，
`pnpm install` 会报一串 unmet peer。现已把 `@tiptap/react` / `pm` / `starter-kit` /
`extension-link` / `extension-placeholder` / `tiptap-markdown` 统一到 3.29.2，peer 警告清零。

验证：3302 个测试全绿、typecheck 通过、文档站 `next build` 通过、12 个入口体积门禁全绿
（体积零变化 —— 体积门禁在临时工程里全新安装，本来测的就是 range 内的最新依赖）。

跨大版本的 typescript 7 / vitest 4 / jsdom 30 / @types/node 26 / react-easy-crop 6 不在本次范围内。
