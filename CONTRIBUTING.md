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
3. 推送前跑一遍下面的「推 PR 前的本地门禁」
4. 开 PR,填 PR 模板,关联相关 issue
5. CI 通过 + Review 通过后合并

### 推 PR 前的本地门禁

`ci.yml` 里有几项检查要读 `apps/www/out`(静态导出产物),只跑 typecheck + test + build 发现不了;
下面这份清单与 CI 对齐,本地全绿再推。

**1. 生成物先重新生成**(改了组件文档、showcase、changeset 都要):

```bash
pnpm docs:all
pnpm readme:sync
packages/hulian-scan/node_modules/.bin/tsx packages/hulian-scan/src/inventory/generate.ts
git status   # 应只剩你本来就要提交的改动
```

**2. 先 build,再跑依赖产物的检查**:

```bash
pnpm --filter www build      # 产出 apps/www/out,也会刷新 .next/types
pnpm typecheck               # 放在 build 之后:.next/types 是旧构建的残留时会报找不到已删页面
cd packages/ui && npx vitest run --project unit && npx vitest run --project browser; cd ../..
pnpm test:scripts            # scripts/*.test.mjs,含 showcase 英文译文的受保护 token 检查
pnpm conventions:check && pnpm showcase:check && pnpm candidates:check
pnpm docs:i18n:check && pnpm check:rsc-claims && pnpm size
pnpm docs:i18n:output        # 英文站产物里不许有中文字符(含全角「｜」)
pnpm docs:i18n:links         # 中英文站的链接与页内锚点都要存在
pnpm docs:check:showcase-browser && pnpm docs:check:admin-demos
```

browser 测试的输出很长,重定向到文件再 grep,别直接接管道。

**3. 还原与本次无关的改动**:`pnpm --filter www build` 会改写
`apps/www/app/blocks/block-fixture-sources.en.json`;本地时区与 CI 不同时,`pnpm changelog`
会改写 `apps/www/lib/changelog*.json` 里已发版本的日期。这些都用 `git checkout --` 还原,不要提交。

**容易踩的文档规则**(都会挂 CI):

- 英文组件文档(`*.en.md`)的表格里,联合类型的竖线写 `\|`,不要写全角 `｜`(中文文档可以用)。
- 组件文档的小标题不生成锚点 id,不要写 `[X](#x)` 这种页内链接,写成 `` `X` `` 即可。
- `apps/www/i18n/showcase-copy.en.json` 的译文要保留原文里的受保护 token:代码标识符、`(N)` 这类占位,
  原文出现几次译文就要出现几次;单复数不同也算丢(原文 `token`,译文只写 `tokens` 会挂)。

### 叠放 PR(stacked PR)

一个功能分几片提交时,后一片以前一片的分支为 base。仓库用 squash 合并,而且没有开「合并后自动删分支」,
所以合并顺序要这样走,否则下游 PR 会被关掉或带上重复提交:

1. squash 合并最底下那个 PR(base 是 `master`)。
2. **先**把下一个 PR 的 base 改成 `master`(`gh pr edit <N> --base master`),**再**删掉刚合并的分支。
   顺序反了 GitHub 会直接关闭下游 PR(base 分支不存在),只能把分支按原 SHA 推回去再重开。
3. 把下一片 rebase 到新的 master 上,只保留它自己的提交:
   `git rebase --onto origin/master <刚合并分支的旧 tip> <下一片分支>`,跑门禁后 `--force-with-lease` 推送。
4. 下游 PR 的完整 CI 只在 base 是 `master` 时才跑,改指之前只有 Cloudflare 预览。

## 发版(维护者)

用 **changesets** 管版本,GitHub Actions 自动发布。详见 [`docs/publishing.md`](docs/publishing.md)。

## 许可证

提交即代表你同意你的贡献以本项目的 [MIT 许可证](LICENSE) 授权。
