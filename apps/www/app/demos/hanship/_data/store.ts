import type { Project, Deploy, Domain, EnvVar, BuildStep, LogLine } from "./types";

// 瀚舰 HanShip 全内存 mock 数据（SSoT）。距今时间一律存「分钟/天」偏移，
// 渲染时换算成实时 RelativeTime，保证 demo 怎么放都「永远新鲜」。

export const projects: Project[] = [
  {
    id: "docs",
    name: "hulianui-docs",
    slug: "hulianui",
    framework: "Next.js",
    repo: "hulianui/hulian",
    productionBranch: "master",
    prodUrl: "hulianui.haloritual.com",
    domainCount: 2,
    autoDeploy: true,
    currentDeployId: "d-docs-1",
    createdAgoDays: 94,
  },
  {
    id: "shop",
    name: "hanshop-web",
    slug: "hanshop",
    framework: "Vite",
    repo: "hulianui/hanshop-web",
    productionBranch: "main",
    prodUrl: "hanshop.hanship.dev",
    domainCount: 0,
    autoDeploy: true,
    currentDeployId: "d-shop-1",
    createdAgoDays: 47,
  },
  {
    id: "site",
    name: "hancloud-site",
    slug: "hancloud",
    framework: "Astro",
    repo: "hulianui/hancloud-site",
    productionBranch: "main",
    prodUrl: "hancloud.com",
    domainCount: 3,
    autoDeploy: true,
    currentDeployId: "d-site-1",
    createdAgoDays: 173,
  },
  {
    id: "console",
    name: "hanhub-console",
    slug: "hanhub",
    framework: "Next.js",
    repo: "hulianui/hanhub-console",
    productionBranch: "main",
    prodUrl: "hanhub.hanship.dev",
    domainCount: 1,
    autoDeploy: false,
    currentDeployId: "d-console-1",
    createdAgoDays: 21,
  },
  {
    id: "edge",
    name: "han-edge-api",
    slug: "han-edge",
    framework: "静态站点",
    repo: "hulianui/han-edge-api",
    productionBranch: "main",
    prodUrl: "han-edge.hanship.dev",
    domainCount: 0,
    autoDeploy: true,
    currentDeployId: "d-edge-1",
    createdAgoDays: 8,
  },
];

const url = (sha: string, slug: string) => `${sha.slice(0, 8)}.${slug}.hanship.dev`;

export const deploys: Deploy[] = [
  // —— hulianui-docs：镜像真实 git log（复刻截图）——
  { id: "d-docs-1", projectId: "docs", env: "production", branch: "master", sha: "10577b9a3f21", message: "fix(www,mocks): ai-chat 部署站无响应——加 prod 客户端内存回退", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("10577b9a", "hulianui"), agoMin: 9, durationSec: 132, current: true },
  { id: "d-docs-prev", projectId: "docs", env: "preview", branch: "feat/deploy-status", sha: "b1c4e09d77aa", message: "feat(ui): GitCommit + DeployStatus 组件", author: "瑚琏", authorInitial: "瑚", status: "building", url: url("b1c4e09d", "hulianui"), agoMin: 2, durationSec: null },
  { id: "d-docs-2", projectId: "docs", env: "production", branch: "master", sha: "33434b9c8e10", message: "feat(www): 组件页加 loading.tsx 骨架，切组件时右侧即时反馈", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("33434b9c", "hulianui"), agoMin: 22, durationSec: 128 },
  { id: "d-docs-3", projectId: "docs", env: "production", branch: "master", sha: "36e347f2b401", message: "feat(www): 全局路由进度条，修复 App Router 导航零反馈", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("36e347f2", "hulianui"), agoMin: 28, durationSec: 141 },
  { id: "d-docs-4", projectId: "docs", env: "preview", branch: "fix/blocks-tier", sha: "9a02ffce1234", message: "fix(blocks): 区块画廊缩略图越界", author: "林屿", authorInitial: "林", status: "error", url: url("9a02ffce", "hulianui"), agoMin: 34, durationSec: 58 },
  { id: "d-docs-5", projectId: "docs", env: "production", branch: "master", sha: "24fa7bb6cd09", message: "docs(readme): 加「发版（维护者）」章节 + 更新当前版本/文档站链接", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("24fa7bb6", "hulianui"), agoMin: 40, durationSec: 119 },
  { id: "d-docs-6", projectId: "docs", env: "production", branch: "master", sha: "cb2ae42f7b88", message: "chore(release): @hulianui/ui@0.1.2 + @hulianui/tokens@0.1.1（发丝边框）", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("cb2ae42f", "hulianui"), agoMin: 61, durationSec: 137 },
  { id: "d-docs-7", projectId: "docs", env: "preview", branch: "chore/deps", sha: "7711aa0099ee", message: "chore(deps): bump base-ui rc.1", author: "林屿", authorInitial: "林", status: "canceled", url: url("7711aa00", "hulianui"), agoMin: 88, durationSec: null },

  // —— hanshop-web ——
  { id: "d-shop-1", projectId: "shop", env: "production", branch: "main", sha: "5fa1c2d3e4b6", message: "feat(cart): 优惠券叠加规则 + 结算页地址级联", author: "周岚", authorInitial: "周", status: "ready", url: url("5fa1c2d3", "hanshop"), agoMin: 51, durationSec: 73, current: true },
  { id: "d-shop-2", projectId: "shop", env: "preview", branch: "feat/sku-gallery", sha: "aa12bb34cc56", message: "feat(pdp): SKU 图廊放大镜", author: "周岚", authorInitial: "周", status: "ready", url: url("aa12bb34", "hanshop"), agoMin: 120, durationSec: 69 },
  { id: "d-shop-3", projectId: "shop", env: "preview", branch: "fix/checkout", sha: "dd99ee88ff00", message: "fix(checkout): 库存为 0 时下单按钮未禁用", author: "周岚", authorInitial: "周", status: "building", url: url("dd99ee88", "hanshop"), agoMin: 4, durationSec: null },
  { id: "d-shop-4", projectId: "shop", env: "production", branch: "main", sha: "120fae93cd71", message: "perf(list): 商品列表首屏图片懒加载", author: "周岚", authorInitial: "周", status: "ready", url: url("120fae93", "hanshop"), agoMin: 300, durationSec: 71 },

  // —— hancloud-site ——
  { id: "d-site-1", projectId: "site", env: "production", branch: "main", sha: "e0c1a2b3d4f5", message: "content: 更新定价页 + 新增客户证言", author: "陈默", authorInitial: "陈", status: "ready", url: url("e0c1a2b3", "hancloud"), agoMin: 220, durationSec: 41, current: true },
  { id: "d-site-2", projectId: "site", env: "preview", branch: "feat/hero-v2", sha: "f6a7b8c9d0e1", message: "feat(hero): 新首屏 Bento 布局", author: "陈默", authorInitial: "陈", status: "ready", url: url("f6a7b8c9", "hancloud"), agoMin: 480, durationSec: 44 },
  { id: "d-site-3", projectId: "site", env: "production", branch: "main", sha: "aabbccddeeff", message: "fix(seo): sitemap 缺失子页面", author: "陈默", authorInitial: "陈", status: "ready", url: url("aabbccdd", "hancloud"), agoMin: 1440, durationSec: 39 },

  // —— hanhub-console（关了自动部署）——
  { id: "d-console-1", projectId: "console", env: "production", branch: "main", sha: "1234abcd5678", message: "feat(keys): 密钥分组限额 + 一次性展示", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("1234abcd", "hanhub"), agoMin: 600, durationSec: 156, current: true },
  { id: "d-console-2", projectId: "console", env: "preview", branch: "feat/health-probe", sha: "8765dcba4321", message: "feat(health): 渠道测速 + 熔断转移", author: "瑚琏", authorInitial: "瑚", status: "error", url: url("8765dcba", "hanhub"), agoMin: 90, durationSec: 88 },
  { id: "d-console-3", projectId: "console", env: "preview", branch: "chore/lint", sha: "0f0f0f0f1010", message: "chore: 修 eslint 告警", author: "林屿", authorInitial: "林", status: "skipped", url: url("0f0f0f0f", "hanhub"), agoMin: 110, durationSec: null },

  // —— han-edge-api ——
  { id: "d-edge-1", projectId: "edge", env: "production", branch: "main", sha: "c0ffee001122", message: "init: 边缘网关静态托管", author: "瑚琏", authorInitial: "瑚", status: "ready", url: url("c0ffee00", "han-edge"), agoMin: 11520, durationSec: 22, current: true },
  { id: "d-edge-2", projectId: "edge", env: "preview", branch: "feat/cache", sha: "deadbeef3344", message: "feat: 边缘缓存策略", author: "瑚琏", authorInitial: "瑚", status: "queued", url: url("deadbeef", "han-edge"), agoMin: 1, durationSec: null },
];

// —— 部署详情：构建步骤 + 构建日志（按 deploy 状态派生“走到哪一步”）——
export const buildSteps: BuildStep[] = [
  { id: "s1", name: "克隆仓库", status: "ready", durationSec: 3 },
  { id: "s2", name: "安装依赖（pnpm install）", status: "ready", durationSec: 46 },
  { id: "s3", name: "构建（next build）", status: "ready", durationSec: 71 },
  { id: "s4", name: "上传产物到边缘网络", status: "ready", durationSec: 9 },
  { id: "s5", name: "分配域名 / 生效", status: "ready", durationSec: 3 },
];

export const buildLog: LogLine[] = [
  { at: 0, level: "info", message: "正在克隆 hulianui/hulian (分支 master, commit 10577b9)…" },
  { at: 3, level: "success", message: "✓ 仓库克隆完成" },
  { at: 4, level: "info", message: "检测到框架预设：Next.js（output: export）" },
  { at: 5, level: "info", message: "$ pnpm install --frozen-lockfile" },
  { at: 9, level: "debug", message: "Lockfile 命中，复用缓存依赖 1284 个包" },
  { at: 49, level: "success", message: "✓ 依赖安装完成 (46.2s)" },
  { at: 50, level: "info", message: "$ pnpm --filter www build" },
  { at: 72, level: "warn", message: "⚠ 检测到 2 个 unoptimized <img>（export 模式预期行为）" },
  { at: 118, level: "success", message: "✓ 构建完成：导出 218 个静态页面" },
  { at: 119, level: "info", message: "上传产物到边缘网络（142 个文件，6.8 MB）…" },
  { at: 128, level: "success", message: "✓ 上传完成，已分发到 310 个边缘节点" },
  { at: 131, level: "success", message: "✓ 部署就绪 → https://hulianui.haloritual.com" },
];

export const envVars: EnvVar[] = [
  { id: "e1", key: "NEXT_PUBLIC_SITE_URL", value: "https://hulianui.haloritual.com", targets: ["production"], secret: false, updatedAgoDays: 12 },
  { id: "e2", key: "NEXT_PUBLIC_API_BASE", value: "https://api.hanship.dev/v1", targets: ["production", "preview"], secret: false, updatedAgoDays: 12 },
  { id: "e3", key: "HANSHIP_DEPLOY_TOKEN", value: "hs_live_9c2f8a1b6d4e7f0a3c5b8e2d1f4a6c9b", targets: ["production"], secret: true, updatedAgoDays: 3 },
  { id: "e4", key: "TURNSTILE_SECRET", value: "0x4AAAAAAA_b7e3c1d9f2a5e8c4b6d0f1a3", targets: ["production", "preview"], secret: true, updatedAgoDays: 30 },
  { id: "e5", key: "ANALYTICS_ID", value: "G-HANSHIP-2026", targets: ["production"], secret: false, updatedAgoDays: 47 },
  { id: "e6", key: "PREVIEW_BASIC_AUTH", value: "preview:han-ship-2026", targets: ["preview"], secret: true, updatedAgoDays: 9 },
];

export const domains: Domain[] = [
  { id: "dm1", projectId: "docs", host: "hulianui.haloritual.com", type: "primary", ssl: "active", dns: "valid", addedAgoDays: 90 },
  { id: "dm2", projectId: "docs", host: "hulian-7u3.pages.dev", type: "preview", ssl: "active", dns: "valid", addedAgoDays: 94 },
  { id: "dm3", projectId: "docs", host: "www.hulianui.com", type: "redirect", ssl: "pending", dns: "pending", addedAgoDays: 0 },
  { id: "dm4", projectId: "site", host: "hancloud.com", type: "primary", ssl: "active", dns: "valid", addedAgoDays: 170 },
  { id: "dm5", projectId: "site", host: "www.hancloud.com", type: "redirect", ssl: "active", dns: "valid", addedAgoDays: 170 },
  { id: "dm6", projectId: "site", host: "hancloud.cn", type: "primary", ssl: "error", dns: "misconfigured", addedAgoDays: 2 },
  { id: "dm7", projectId: "console", host: "console.hanhub.cn", type: "primary", ssl: "active", dns: "valid", addedAgoDays: 18 },
];

// —— 查询助手 ——
export const projectById = (id: string) => projects.find((p) => p.id === id);
export const deployById = (id: string) => deploys.find((d) => d.id === id);
export const deploysOf = (projectId: string) => deploys.filter((d) => d.projectId === projectId);
export const domainsOf = (projectId: string) => domains.filter((d) => d.projectId === projectId);
