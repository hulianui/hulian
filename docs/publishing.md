# 发布与消费 @hulianui/ui

本仓库用 **changesets** 管版本，发布到公共 **npmjs**（scope `@hulianui`，`access: public`）——消费方**零配置、零 token** 即可安装。
发布形态是 **源码包（发 `src/`，不编译 dist）** —— 下游必须能转译 TSX（Next/Vite 可以）。

会发布的包（其余 `private` 包自动跳过）：

| 包 | 作用 | 下游是否必装 |
|----|------|--------------|
| `@hulianui/ui` | 组件库（TSX 源码） | ✅ |
| `@hulianui/tokens` | 设计 token CSS（`--primary` 等变量、换肤） | ✅（`@hulianui/ui` 的样式依赖它） |
| `@hulianui/mocks` | 测试用 MSW mock | ❌ 已设 private |

---

## 一、维护者日常流程（修完 bug 怎么让下游拿到）

```bash
# 1. 改完 @hulianui/ui 的 bug 后，记录一条变更（交互式：选包 + patch/minor + 写一句说明）
pnpm changeset

# 2. 本地落版本号 + 写 CHANGELOG（消费掉 changeset）
pnpm version-packages

# 3. 提交并推送
git add -A && git commit -m "chore(release): bump" && git push
```

push 到 `master` 后，`.github/workflows/release.yml` 自动 `pnpm release` 把版本号高于 npmjs 已发布版的包发布出去，并打 git tag。

> **务必本地先 `pnpm version-packages` 再 push**：若只 push 了 `.changeset/*.md` 而没落版本，CI 会去开「Version Packages」PR；而本组织当前关着「允许 Actions 创建 PR」，那条路会卡住。本地先落版本 → CI 看到没有待消费 changeset → 直接 publish，绕开 PR。

下游项目随后：

```bash
pnpm update @hulianui/ui @hulianui/tokens   # 一行更新到最新
```

> 0.x 阶段建议都用 `patch`（bug 修复）/`minor`（加组件），下游 `^0.4.0` 自动吃 patch。

---

## 二、下游项目怎么接入（独立 repo）

### 1. 安装（公共 npmjs · 零配置零 token）

无需 `.npmrc`、无需 token，直接装：

```bash
pnpm add @hulianui/ui @hulianui/tokens
```

`react` / `react-dom` / `tailwindcss` / `@base-ui/react` / `motion` 为 peer，自行安装。

### 2. 引入 token CSS（否则组件没颜色/没主题）

在全局样式或根 layout 里 import 一次：

```ts
import "@hulianui/tokens/preset.css";
```

### 3. Next.js：转译源码包（**必做**，因为发的是 TSX）

`next.config.ts`：

```ts
export default {
  transpilePackages: ["@hulianui/ui"],
  // 跑 webpack dev（Next 15 及以下）时必须成对写：transpilePackages 把整棵源码放回
  // loader 路径，而 dev 不 tree-shake，只写上面一条会让冷编译慢数倍
  //（实测 16.5s → 3.9s、模块 7378 → 1730）。Next 16 的 Turbopack 实测无差异，加了也无害。
  experimental: { optimizePackageImports: ["@hulianui/ui"] },
};
```

Vite 一般无需额外配置；只用少数几个组件时改走子路径导入（`@hulianui/ui/<slug>`）。
详见 [consuming.md 第 4 节](./consuming.md#4-只用少数几个组件时从子路径引入)。

### 4. Tailwind v4：让它扫描组件类名

全局 CSS 里加（路径按你项目到 node_modules 的相对深度调整）：

```css
@source "../node_modules/@hulianui/ui/src";
```

### 5. 使用

```tsx
import { Button } from "@hulianui/ui";

export default () => <Button>你好</Button>;
```

---

## 三、首次启用清单（一次性，维护者操作）

> 切到 npmjs 后，**首次发布前**必须完成以下步骤，否则 release workflow 的 publish 步骤会因缺 `NPM_TOKEN` 失败。

1. **注册 npmjs 组织 `hulianui`**：scope `@hulianui` 必须对应同名组织（<https://www.npmjs.com/org/create>）。
2. **生成 npm Automation token**：npmjs → Access Tokens → Generate New Token → **Automation**（CI 友好，绕过 2FA）。
3. **加 GitHub Actions secret**：仓库 Settings → Secrets and variables → Actions → New repository secret，名字 **`NPM_TOKEN`**，值为上一步的 token。
4. **放行 Actions 开 PR（可选）**：仓库 Settings → Actions → General → Workflow permissions → 勾 **Read and write** + **Allow GitHub Actions to create and approve pull requests**（用 Version PR 流程时才需要；本仓库默认走"本地先 version 再 push"绕开它）。
5. **首发**：本地 `pnpm version-packages` 落好版本 → push，release workflow 直接 publish 到 npmjs（registry 上还没该版本时 action 直接发布）。
   - 或本地手动首发：`export NODE_AUTH_TOKEN=<npm token>` 后 `pnpm release`。

---

## 四、历史：曾用 GitHub Packages

本项目早期发布在 GitHub Packages 私有 registry（`@hulianui/ui@0.1.0 → 0.4.0` 等）。其已知限制是 **即便包设为 public，`npm install` 仍强制鉴权**（消费方那两行 `.npmrc` + token 省不掉），不符合"真正开源、零 token 安装"的目标，故已切换到公共 npmjs。

注意 npmjs 与 GitHub Packages 是两套 registry、版本号不互通：迁移后从当前 `package.json` 版本继续递增即可，npmjs 上首发会从当前版本开始。

---

## 五、已知后续优化（非阻塞）

- **重依赖**：`@hulianui/ui` 现把 MUI/recharts/tiptap/vidstack/ogl 全捆在 `dependencies`，下游装一个拖一坨。后续可拆子包或降级为 optional/peer。
- **发 dist**：若将来要给不能转译 node_modules 的环境用，再加 tsup/rollup 构建产物（与本管道正交，不影响版本/发布流程）。
