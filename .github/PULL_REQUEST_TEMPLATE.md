<!-- 感谢贡献！请填写以下信息，便于审查。 -->

## 改动说明

<!-- 这个 PR 做了什么？为什么需要它？ -->

## 类型

- [ ] feat（新功能 / 新组件）
- [ ] fix（修复 bug）
- [ ] docs（文档）
- [ ] refactor / perf / style
- [ ] chore / ci / build

## 关联 issue

<!-- 如 closes #123 -->

## 自检清单

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm test` 全绿
- [ ] `pnpm --filter www build` 通过（若改动影响文档站）
- [ ] 若改动影响 `@hulianui/ui` / `@hulianui/tokens` 对外行为，已 `pnpm changeset` 附变更说明
- [ ] 新增/修改组件已在 4 处注册（barrel / showcase / manifest / registry）并配套测试、showcase、文档
- [ ] 没有在 demo 里打 CSS/行为补丁绕过组件缺口（有缺口则修组件本身）

## 截图 / 录屏（UI 改动必填）

<!-- 明暗两态尽量都给 -->
