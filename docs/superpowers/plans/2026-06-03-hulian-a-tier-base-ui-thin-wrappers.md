# 瑚琏 A 档 Base UI 薄包批 — 执行 plan

spec：`docs/superpowers/specs/2026-06-03-hulian-a-tier-base-ui-thin-wrappers-design.md`
目标：9 slug 一次性 spec→plan→exec 完成（TDD 实现 + 接 IA + 三道门 + 截图自证 + commit）。

## 执行顺序（按复杂度递增，纯皮肤/单件先，多 part 装配后）

| 序 | slug | 目录 | 复杂度 | 备注 |
|----|------|------|--------|------|
| T1 | separator | `separator/` | ★ 纯几何薄包 | 最简，先跑通范式 |
| T2 | toggle | `toggle/` | ★★ Toggle+ToggleGroup 同目录 | CVA + 数组组 |
| T3 | meter | `meter/` | ★★ 几何禁区 | 区别 Progress |
| T4 | number-field | `number-field/` | ★★ Group 装配 | ± 按钮 + Input |
| T5 | checkbox-group | `checkbox-group/` | ★★ 复用 Checkbox | 数组协调 |
| T6 | toolbar | `toolbar/` | ★★★ 多 part | Root/Button/Group/Separator |
| T7 | alert-dialog | `alert-dialog/` | ★★★ overlay | 照搬 dialog.tsx |
| T8 | scroll-area | `scroll-area/` | ★★★ 多 part 装配 | 自定义滚动条 |
| T9 | form | `form/` | ★★ 与 Field 协同 | errors 串联 |

## 每件标准动作（TDD）

1. `require.resolve` + 读该 primitive part `.d.ts` 锁定子组件 props（已在 spec §2 实证，实现时再校验关键件）。
2. 写 `<name>.types.ts`（瑚琏对外 props，收窄 Base UI 类型）。
3. 写 `<name>.test.tsx`（先红：渲染 + role/aria + 受控 + disabled + 皮肤类 + 几何禁区）。
4. 写 `<name>.tsx`（薄包，令测试转绿）。
5. 写 `<name>.showcase.tsx`（ShowcaseSpec：controls + states + renderWithProps + toCode）。
6. 写 `index.ts`（导出组件 + 类型 + showcase）。
7. 接入：`packages/ui/src/index.ts` barrel + `apps/www/lib/manifest.ts` + `apps/www/lib/registry.tsx`。

## 验收门（全 9 件落完后统一跑）

- `pnpm --filter @hulianui/ui typecheck`（或 turbo `typecheck --force`）全绿。
- `pnpm --filter @hulianui/ui test --force` 全绿（含新增 ~50 测试 + manifest 契约 4 条）。
- `pnpm build --filter=www`（SSG，42 component 页全过；recharts 类 0 宽 warning 无害）。
- 隔离 chromium CDP 截图：抽查 ≥4 件（separator/toggle/meter/alert-dialog）明暗两态像素自证，AlertDialog 先触发再截。

## commit 切分（race-safe，全程 `git commit -- <pathspec>`）

- `docs(spec/plan)`：本 spec + plan（首 commit）。
- 每件或每 2–3 件一个 `feat(ui): <Name> ...`（组件四件套 + barrel）+ 紧随 `feat(www): <Name> 接入 IA`（manifest+registry）。
- 末尾若截图/修整：`fix(ui)`/`chore`。

## 并发纪律

- 精确 `git commit -- <具体路径>`，绝不 `-A`。
- manifest/registry/index.ts 改动用**幂等读改写**（检测 slug 已存在则跳过），提交前 `git diff` 仅核对自身增量。
- 门禁红先判：是否触碰自身 scope？非自身（并行 session WIP）→ isolate 不碰，重跑确认。

## 完成定义（goal：spec-plan-exec 完成再通知）

9 slug 全部：四件套落地 + 接入 4 处 + 三道门绿 + 关键件截图自证 + commit & push（若用户惯例 push）。manifest 从 33 → 42。完成后通知用户并附覆盖率对照。
