# 发布与消费 @hulianui/ui

本仓库用 **changesets** 管版本，发布到 **GitHub Packages**（私有 npm registry，组织 `hulianui`，免费免运维）。
当前发布形态是 **源码包（发 `src/`，不编译 dist）** —— 下游必须能转译 TSX（Next/Vite 可以）。

会发布的包（其余 `private` 包自动跳过）：

| 包 | 作用 | 下游是否必装 |
|----|------|--------------|
| `@hulianui/ui` | 组件库（TSX 源码） | ✅ |
| `@hulianui/tokens` | 设计 token CSS（`--primary` 等变量、换肤） | ✅（`@hulianui/ui` 的样式依赖它） |
| `@hulianui/mocks` | 测试用 MSW mock | ❌ 已设 private |

---

## 一、你的日常流程（修完 bug 怎么让下游拿到）

```bash
# 1. 改完 @hulianui/ui 的 bug 后，记录一条变更（交互式：选包 + patch/minor + 写一句说明）
pnpm changeset

# 2. 提交（changeset 文件会一起进 git）
git add . && git commit -m "fix(ui): 修 XXX" && git push
```

push 到 `master` 后，`.github/workflows/release.yml` 自动：
- 若有未消费的 changeset → 开一个 **「Version Packages」PR**（自动 bump 版本号 + 写 CHANGELOG）；
- 你**合并该 PR** → action 自动 `pnpm release` 发布新版本到 GitHub Packages。

下游项目随后：

```bash
pnpm update @hulianui/ui @hulianui/tokens   # 一行更新到最新
```

> 0.x 阶段建议都用 `patch`（bug 修复）/`minor`（加组件），下游 `^0.1.0` 自动吃 patch。

---

## 二、下游项目怎么接入（独立 repo）

### 1. 配 registry（拉私有包要认证）

项目根 `.npmrc`：

```
@hulianui:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${HULIAN_NPM_TOKEN}
```

`HULIAN_NPM_TOKEN` 走环境变量，不要写进文件提交。token = 一个有 **`read:packages`** 权限的 GitHub PAT（在 GitHub → Settings → Developer settings → Personal access tokens 生成）。
本地：`export HULIAN_NPM_TOKEN=ghp_xxx`；CI：放进 secrets。

### 2. 安装

```bash
pnpm add @hulianui/ui @hulianui/tokens
```

### 3. 引入 token CSS（否则组件没颜色/没主题）

在全局样式或根 layout 里 import 一次：

```ts
import "@hulianui/tokens/preset.css";
```

### 4. Next.js：转译源码包（**必做**，因为发的是 TSX）

`next.config.ts`：

```ts
export default {
  transpilePackages: ["@hulianui/ui"],
};
```

Vite 一般无需额外配置。

### 5. Tailwind v4：让它扫描组件类名

全局 CSS 里加（路径按你项目到 node_modules 的相对深度调整）：

```css
@source "../node_modules/@hulianui/ui/src";
```

### 6. 使用

```tsx
import { Button } from "@hulianui/ui";

export default () => <Button>你好</Button>;
```

---

## 三、首次启用清单（一次性，在 GitHub 网页操作）

1. ✅ **建组织**（已完成）：组织 `hulian` 被占（"虎连"），实建 `hulianui`；GitHub Packages 强制 scope=组织名，故 scope 为 `@hulianui`。
2. ✅ **迁 repo**（已完成）：`Zhanglala103838/hulian` 已转到组织 `hulianui` 下，remote 已改 `https://github.com/hulianui/hulian.git`。
3. **放行 Actions 开 PR**：仓库 Settings → Actions → General → Workflow permissions → 勾 **Read and write** + **Allow GitHub Actions to create and approve pull requests**（否则 release 的 Version PR 开不出来）。
4. **首发**：`@hulianui/ui`/`@hulianui/tokens` 已设基线 `0.1.0`。迁好后 push 一次，release workflow 会直接发布 `0.1.0`（registry 上还没有该版本时 action 直接 publish）。
   - 或本地手动首发：`export NODE_AUTH_TOKEN=<有 write:packages 的 PAT>` 后 `pnpm release`。

> 发布认证：CI 内用内置 `GITHUB_TOKEN`（已在 release.yml 配好 `packages: write`），**无需额外配 secret**。

---

## 四、私有 → 公有 / 换 registry

### 反直觉点：GitHub Packages 包设公开，安装仍要 token

GitHub Packages 的 npm registry **即便把包设为 public，`npm install` 仍强制鉴权**（和 npmjs 不同，这是 GH Packages 的已知限制）。把包从 private 改 public 只带来：

- 任何人都能看到 / 安装（不再限组织成员）；
- 消费方 `.npmrc` 里的 token 不再需要特定权限，任意有效 GitHub token 即可——但**那两行 `.npmrc` 仍省不掉**。

操作：包页面 → Package settings → Change visibility → Public（或组织 Packages 设置批量改）。代码/流程无需改动。

### 真正免 token 公开：换到 npmjs.com

要做到 `pnpm add @hulianui/ui` **零配置零 token** 安装，必须把 registry 从 GitHub Packages 换成公共 **npmjs.com**：

1. 在 npmjs.com 注册组织 `hulianui`（scope `@hulianui` 对应组织名）。
2. 删除各包 `package.json` 里的 `publishConfig.registry`（或改成 `https://registry.npmjs.org`），`access` 改 `public`：
   ```jsonc
   "publishConfig": { "access": "public" }   // registry 缺省即 npmjs
   ```
3. 删根 `.npmrc` 里的 `@hulianui:registry=...github...` 行（让它走默认 npmjs）。
4. CI（`release.yml`）改用 **npm token**：在 npmjs 生成 Automation token → 存仓库 secret `NPM_TOKEN` → workflow 把 `NODE_AUTH_TOKEN` 换成 `${{ secrets.NPM_TOKEN }}`，并去掉 `packages: write`（npmjs 不用 GITHUB_TOKEN）。
5. 消费方此后**无需 `.npmrc`、无需 token**，直接 `pnpm add @hulianui/ui`。

> 注意：包名一旦在 npmjs 占用即公开可见，且 npmjs 与 GitHub Packages 是两套 registry、版本号不互通（迁移时建议从当前版本继续递增，避免下游困惑）。

## 五、已知后续优化（非阻塞）

- **重依赖**：`@hulianui/ui` 现把 MUI/recharts/tiptap/vidstack/ogl 全捆在 `dependencies`，下游装一个拖一坨。后续可拆子包或降级为 optional/peer。
- **发 dist**：若将来要给不能转译 node_modules 的环境用，再加 tsup/rollup 构建产物（与本管道正交，不影响版本/发布流程）。
