# 瑚琏 Hulian — 动效族特效背景批 实施 plan

- **日期**: 2026-06-03
- **对应 spec**: `2026-06-03-hulian-effects-backgrounds-design.md`
- **范围**: `effects` 5 件 —— DotPattern · GridPattern · RetroGrid · Ripple · StripedPattern
- **模式**: TDD（先红后绿，对齐 Marquee 测试粒度），自主推进，收尾统一通知
- **基线**: 启动前 `@hulian/ui` 测试 36 文件 / 206 用例全绿

## 工序（每件四件套 + 桶，统一接线收尾）

### Step 0 — preset.css 关键帧（先落，组件依赖它）
- [ ] `packages/tokens/src/preset.css` 追加 `@keyframes hulian-retro-grid` + `@keyframes hulian-ripple`（紧随 hulian-marquee）

### Step 1 — DotPattern（纯 SVG · 无动画）
- [ ] `dot-pattern.types.ts` — DotPatternProps
- [ ] `dot-pattern.test.tsx` — 5 用例（先红）
- [ ] `dot-pattern.tsx` — useId pattern + circle fill=currentColor + absolute inset-0 pointer-events-none text-border
- [ ] `dot-pattern.showcase.tsx` + `index.ts`

### Step 2 — GridPattern（纯 SVG · 无动画）
- [ ] types / test(先红) / tsx（path 网格线 stroke=currentColor）/ showcase / index

### Step 3 — RetroGrid（CSS 动画 · 依赖 Step 0 关键帧）
- [ ] types / test(先红) / tsx（perspective + rotateX + 动画层 hulian-retro-grid + motion-reduce + config CSS 变量）/ showcase / index

### Step 4 — Ripple（CSS 动画 · 依赖 Step 0 关键帧）
- [ ] types / test(先红) / tsx（numCircles 个圈 div + 逐圈尺寸/延迟内联 + motion-reduce）/ showcase / index

### Step 5 — StripedPattern（纯 CSS · 无动画）
- [ ] types / test(先红) / tsx（repeating-linear-gradient + config CSS 变量）/ showcase / index

### Step 6 — 统一接线（5 处）
- [ ] `packages/ui/src/index.ts` — 5 个 export
- [ ] `apps/www/lib/manifest.ts` — 5 个 ComponentMeta（category effects / status new）
- [ ] `apps/www/lib/registry.tsx` — 5 个 showcase import + slug 映射

### Step 7 — 三道门验证
- [ ] `pnpm --filter @hulian/ui test` 全绿（206 + ~25 = ~231）
- [ ] `pnpm --filter @hulian/ui typecheck` 干净
- [ ] `pnpm --filter www typecheck` 干净（registry/manifest 接线无类型错）

### Step 8 — 收尾
- [ ] 精确 `git add` 本批文件（禁 -A，别扫他人 WIP）
- [ ] commit（`feat(ui): effects 特效背景批 ×5 ...`）
- [ ] 更新项目记忆 `hulian-phase-status`
- [ ] 通知用户

## 风险/坑预案
- **useId in RSC**：useId 可在 server 组件用（React 18+），不需 "use client"；若 typecheck/test 报错则退化为模块级递增 id（但多实例 SSR 不稳，优先 useId）。
- **SVG pattern id 撞车**：多实例同页必须用 useId 保证唯一。
- **测试选择器**：SVG 元素用 `container.querySelector("pattern")` / `querySelector("svg")`；圈 div 用 `:scope > div` 计数（同 Marquee tracksOf 思路）。
- **精确 git add**：仓库有大量他人 WIP（截图 png、其他 .tsx 改动），只 add 本批 5 目录 + 4 个接线文件 + 2 个 spec/plan 文档。
