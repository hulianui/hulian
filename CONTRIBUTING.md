# 贡献指南 · Contributing

感谢你愿意为 **瑚琏 Hulian** 出力 🙌。本文说明本地开发、提交规范与发版流程。

## 仓库结构

这是一个 pnpm + Turbo 的 monorepo:

```
packages/
  ui/      @hulianui/ui     —— React 组件库（源码分发，发 src/）
  tokens/  @hulianui/tokens —— OKLCH 设计令牌 + Tailwind v4 preset
  mocks/   @hulianui/mocks  —— 内部 mock 数据（私有，不发布）
apps/
  www/     文档站（Next.js 静态导出 · 100% dogfood 自家组件）
  desktop/ Tauri 桌面壳
```

## 环境要求

- Node.js **>= 20**（CI 用 22）
- pnpm **8.15.5**（见根 `package.json` 的 `packageManager`，建议用 `corepack enable` 锁版本）

## 本地开发

```bash
pnpm install              # 安装依赖
pnpm dev                  # 起文档站（apps/www）预览组件
pnpm --filter www dev     # 同上（避免根脚本误杀桌面 app 进程）
pnpm test                 # 跑全部 vitest 单测
pnpm typecheck            # 全量类型检查
pnpm --filter www build   # 文档站静态导出（CI 第三道门）
```

## 加 / 改组件

新增组件需在 **4 处注册**(barrel / showcase / manifest / registry),并配套:

1. 组件源 `packages/ui/src/<category>/<name>.tsx`
2. 单元测试 `<name>.test.tsx`(纯函数/几何逻辑尽量抽出来测)
3. 活示例 `<name>.showcase.tsx`
4. 组件文档 `<name>.md`(Props / Events / Slots)

文档/registry 改完跑 `pnpm docs:all` 重新生成 `llms-full.txt` / `llms.txt` / registry。

> 设计原则:**纯皮肤优先、尽量 RSC、token 吃主题、不在 demo 打补丁绕组件缺口**——遇到 demo 需要 CSS hack 才好用,说明组件有缺口,去修组件。

## 代码风格

仓库提供 `.editorconfig` 与 `.prettierrc.json`(2 空格缩进、双引号、分号、`printWidth 100`、尾逗号)。多数编辑器会自动套用 `.editorconfig`;需要时可手动跑 `npx prettier --write <文件>`。**格式化目前不进 CI 门禁**,但请保持与周边代码一致的风格。

## 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

`type`: `feat` | `fix` | `perf` | `refactor` | `style` | `docs` | `test` | `chore` | `ci` | `build` | `security` | `breaking`

提交前请确保 **typecheck + test + build 三道门全绿**(同 CI)。

## Pull Request

1. 从 `master` 切分支(`feat/...` / `fix/...`)
2. 改动若影响 `@hulianui/ui` 或 `@hulianui/tokens` 的对外行为,**附一条 changeset**:
   ```bash
   pnpm changeset   # 选包 + patch/minor/major + 写说明
   ```
3. 开 PR,填 PR 模板,关联相关 issue
4. CI 通过 + Review 通过后合并

## 发版(维护者)

用 **changesets** 管版本,GitHub Actions 自动发布。详见 [`docs/publishing.md`](docs/publishing.md)。

## 许可证

提交即代表你同意你的贡献以本项目的 [MIT 许可证](LICENSE) 授权。
