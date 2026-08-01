# 部署文档站（apps/www）

文档站是 **Next.js 静态导出**（`output: "export"`，产物在 `apps/www/out/`，纯静态 HTML，无 SSR/server action）。可部署到任何静态托管。

**站要公开、源码保持私有** → 用 **Cloudflare Pages** 或 **Vercel**（均免费、支持连私有仓库、支持自定义域）。GitHub Pages 不适合（私有仓库要付费），故不用。

---

## 通用构建参数（两平台一致）

| 项 | 值 |
|----|----|
| 仓库 | `hulianui/hulian`（私有，需在平台授权访问） |
| 根目录 (Root) | 仓库根 `/`（monorepo，pnpm workspace 须从根装） |
| 安装命令 | `pnpm install`（平台按 `pnpm-lock.yaml` + `packageManager` 自动识别 pnpm 8.15.5） |
| 构建命令 | `pnpm --filter www build` |
| 输出目录 | `apps/www/out` |
| Node 版本 | `22`（已由仓库根 `.nvmrc` 固定） |
| 环境变量 | 无（纯静态，无密钥） |

**构建命令不要拆。** `www` 的 `build` 是 `pnpm gen && next build`，`gen` 负责生成 `/r`、`/d`、
`conventions.json` 和 changelog 数据——这些是 Git 忽略的产物（见 `.gitignore`），MCP 的远程模式
和 `/changelog` 页面都依赖它们。此前 `build` 只有 `next build`、生成靠调用方自己记得先跑，
CI 补了这一步而平台的构建命令没有——干净 clone 上只跑 `next build` 会产出缺 `/r` 的站点。
收进 `build` 之后，任何托管平台只要能跑 `pnpm --filter www build`，就得到与 CI 一致的产物。

> 注：2026-08-01 主站停更**与此无关**，病因是下面"注意"里的 Node 补丁版本。当时误判成
> 产物残缺，依据是 `curl /r/registry.json` 回落成 HTML——但那个路径本来就不存在（注册表在
> 根级 `/registry.json`，`/r/` 下是 `button.json` 这样的逐件端点），两个站点在该路径上行为
> 一致。把生成收进 `build` 仍然正确，只是属于防御性加固，不是那次故障的修复。

---

## A. Cloudflare Pages（推荐）

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → 授权并选 `hulianui/hulian`。
2. 构建设置：
   - Framework preset: **None**（别选 Next.js，那会按 SSR 处理；我们是纯静态）
   - Build command: `pnpm install && pnpm --filter www build`
   - Build output directory: `apps/www/out`
   - Root directory: 留空（仓库根）
   - **环境变量不要设 `NODE_VERSION`**，让仓库的 `.node-version` / `.nvmrc`（均为精确补丁号）生效。
     若项目里已经设过，去 Settings → Variables and Secrets 删掉，或改成与 `.nvmrc` 一致的**完整
     补丁号**。写 `22` 这种浮动值会被解析成平台当时的 22 系列默认版本——2026-08-01 主站构建就是
     这么挂的：解析出 22.22.0，而依赖树里 `ini@7.0.0` 要求 `^22.22.2`，`pnpm install` 直接
     `ERR_PNPM_UNSUPPORTED_ENGINE`（`.npmrc` 的 `engine-strict=true` 让这类不匹配是硬失败）。
3. Save and Deploy。首发后给一个 `*.pages.dev` 子域。
4. 自定义域 `hulianui.haloritual.com`（域在阿里云，非 Cloudflare）：
   - Pages 项目 → Custom domains → Set up a domain → 填 `hulianui.haloritual.com`。
   - Cloudflare 给一条 CNAME 目标（`<project>.pages.dev`）→ 去**阿里云 DNS**给主机记录 `hulianui` 加 **CNAME → `<project>.pages.dev`**。
   - **SSL 全自动**：CF 检测到 CNAME 后通过 Cloudflare for SaaS 自动签发免费证书（Universal SSL），几分钟内 HTTPS 生效，**无需手动配证书**。
   - 注：Pages 支持外部域 CNAME（域不必托管在 CF）；这正是 Pages 相对 Workers 自定义域的优势——Workers 自定义域要求整个 zone 在 CF。见 skill `cloudflare-workers-git-static-deploy-needs-wrangler-assets-config`。
5. **删掉旧的 Workers 部署**：之前用 Workers 流程建过一个 `hulian` Worker（连着同一仓库，会随 push 自动构建）。切 Pages 后 `wrangler.jsonc` 已删，旧 Worker 的 `npx wrangler deploy` 会失败 → 去 Workers & Pages 把那个 `hulian` Worker 删掉，避免每次 push 报错 + 双份部署。

## B. Vercel

1. vercel.com → Add New → Project → Import `hulianui/hulian`（授权私有仓库）。
2. 构建设置：
   - Framework Preset: **Next.js**（Vercel 认得 output:export，会当静态站发）
   - Root Directory: `apps/www`（Vercel 会自动识别 pnpm workspace，从根装依赖）
   - Build/Install/Output: 一般自动；若需手填 → Build `pnpm --filter www build`、Output `out`
3. Deploy。给一个 `*.vercel.app` 域。
4. 自定义域：Project → Settings → Domains → 加 `hulianui.haloritual.com`，按提示在阿里云配 CNAME，SSL 自动签发。

---

## 注意

- **basePath**：以上都是部署到**域根**（自定义域或平台子域），**无需 basePath**。只有 GitHub Pages 项目页那种 `/hulian/` 子路径才需要 `basePath`/`assetPrefix`（本仓库没走那条路）。
- 推送 `master` 后平台自动重新构建发布（连了 Git 即 CI/CD）。
- **平台构建失败只能去控制台查**：Cloudflare Pages 走 Git 集成，授权建立在 Cloudflare 账号
  与 GitHub 之间，**仓库里没有、本机也不需要任何 Cloudflare 凭证**（`wrangler whoami` 会报
  未登录，这是正常状态，不是配置丢失）。所以构建日志既不在 GitHub Actions 里，也拿不到
  ——只能 dash.cloudflare.com → 该 Pages 项目 → 失败的部署 → View build log。
  想让日志和部署都收进 CI，就得改走 Direct Upload：建 `Account / Cloudflare Pages / Edit`
  的 API Token，配 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` 两个仓库 secret，
  再加一个 wrangler 直传 job 复用 `www-out` 产物（中文站的 `deploy-zh` 就是这个形状）。
  注意 Git 集成项目与 Direct Upload 项目在 Cloudflare 是两种模式，切换可能要新建项目并
  迁移自定义域。
- 静态站在真实浏览器渲染正常；headless CLI 截图可能空白（与 MSW client gate 有关，见 memory `www-msw-gate-blanks-headless-screenshots`），**不影响线上访问**。
