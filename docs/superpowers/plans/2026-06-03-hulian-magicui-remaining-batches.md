# 瑚琏 — MagicUI 零依赖批次合集 实施 plan

- **对应 spec**: `2026-06-03-hulian-magicui-remaining-batches-design.md`
- **范围**: 18 件 4 批，零新依赖，TDD，每批独立 commit
- **基线**: effects 背景批后 ui 235 测试绿；本合集每批增 ~20-30 用例

## Step 0 — preset.css 关键帧（全合集一次性加 10 个 `hulian-*`）

## 批 2 文字动画（6 · effects）— commit A
- [ ] AuroraText / AnimatedShinyText / AnimatedGradientText（纯 CSS RSC）
- [ ] WordRotate / TypingAnimation / SparklesText（motion client）
- [ ] 各四件套 + 桶；barrel ×6 + manifest ×6 + registry ×6
- [ ] `pnpm --filter @hulianui/ui test` 绿 + ui typecheck

## 批 3 特效按钮（4 · effects）— commit B
- [ ] ShimmerButton / RainbowButton / PulsatingButton（纯 CSS RSC）+ RippleButton（client）
- [ ] 接线 + 门禁

## 批 4 特效核心（5 · effects）— commit C
- [ ] BorderBeam / Meteors / MagicCard（client）+ ShineBorder / GlareHover（纯 CSS RSC）
- [ ] 接线 + 门禁

## 批 5 设备外壳（3 · 新 mockups 分类）— commit D
- [ ] manifest CategoryKey +"mockups" + CATEGORIES +设备外壳
- [ ] Safari / iPhone / Android（纯 CSS RSC）
- [ ] 接线 + 门禁

## Step F — 收尾
- [ ] www typecheck + build --filter=www 一次性
- [ ] 每批边界隔离 chromium 截图抽验
- [ ] 缺口对照文档回写「本轮已落 15 effects + 3 mockups / 仍延后重依赖件」
- [ ] 更新记忆 + 通知用户

## 风险/坑
- 共享 barrel/manifest/registry 被并行 session 写 → 精确 git add + commit 前 `git diff HEAD` 核对仅自增量
- TW v4 `@container`/mask 新工具类可用性不确定 → 用内联 style 兜底（BorderBeam mask、ShimmerButton container 谨慎）
- random 件（Meteors/Sparkles）必 useEffect 客户端生成避 hydration mismatch（Math.random 在组件 useEffect 合法，非 workflow 脚本）
- motion 件 reduced-motion 用 hook 切（DOM 两态一致避 [[motion-reveal-invisible-after-wrapper-becomes-client]]）
