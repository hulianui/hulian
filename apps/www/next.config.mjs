import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 构建/启动期把 @hulianui/ui 真实版本写成 TS 常量（lib/ui-version.ts），供顶栏版本徽标 import。
// 用生成常量而非 process.env：常量是模块字面量，SSG 服务端预渲染与客户端取值一致，无 hydration 不一致、无闪烁。
// dev / build 每次启动都重写 → 版本号永远跟随 packages/ui/package.json，绝不像旧的硬编码 v0.1 那样过时。
const __dirname = dirname(fileURLToPath(import.meta.url));
const uiVersion = JSON.parse(
  readFileSync(join(__dirname, "../../packages/ui/package.json"), "utf8"),
).version;
writeFileSync(
  join(__dirname, "lib/ui-version.ts"),
  `// 自动生成（next.config.mjs 构建期写入），请勿手改。源：packages/ui/package.json\nexport const UI_VERSION = ${JSON.stringify(uiVersion)};\n`,
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出（A4 prod 打包）：next build → out/ 全静态 HTML，供 Tauri 壳 frontendDist 直接打包。
  // 站点全 Static + SSG（[slug] 走 generateStaticParams），无 SSR/route handler/server action → 可安全 export。
  // dev（next dev / 桌面 devUrl 5514）不受影响照常热更。
  output: "export",
  // export 模式禁用 Next 图片优化服务端；本站皆用原生 <img>，标注 unoptimized 兜底。
  images: { unoptimized: true },
  // 工作区包以 TS 源码形式发布，需让 Next 转译
  transpilePackages: ["@hulianui/ui", "@hulianui/mocks"],
};

export default nextConfig;
