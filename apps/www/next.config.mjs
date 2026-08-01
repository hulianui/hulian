import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { withIntlayer } from "next-intlayer/server";

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

const docsLocale = process.env.DOCS_LOCALE === "en" ? "en" : "zh-CN";
const basePath = docsLocale === "en" ? "/en" : "";
const localeBuildDir = docsLocale === "en" ? ".bilingual-build/en" : ".bilingual-build/zh";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出（A4 prod 打包）：next build → out/ 全静态 HTML，供 Tauri 壳 frontendDist 直接打包。
  // 站点全 Static + SSG（[slug] 走 generateStaticParams），无 SSR/route handler/server action → 可安全 export。
  // dev（next dev / 桌面 devUrl 5514）不受影响照常热更。
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_DOCS_LOCALE: docsLocale },
  ...(process.env.DOCS_BILINGUAL_BUILD === "1" ? { distDir: localeBuildDir } : {}),
  // export 模式禁用 Next 图片优化服务端；本站皆用原生 <img>，标注 unoptimized 兜底。
  images: { unoptimized: true },
  // 工作区包以 TS 源码形式发布，需让 Next 转译
  transpilePackages: ["@hulianui/ui", "@hulianui/mocks"],
  experimental: {
    // TypeScript 7 的 npm 包**不再导出编译器 API**（exports 的 "." 只指向 lib/version.cjs，
    // 其余全在 unstable/* 下）。Next 默认走 programmatic API 做构建期类型检查与 tsconfig
    // 解析，因此一升 TS7 就会抛 E1150，`next dev` / `next build` 双双起不来。
    // 这个开关让 Next 改为 spawn 项目本地的 tsc CLI，是升 TS7 的**硬前置**，不是调优项。
    useTypeScriptCli: true,
  },
};

export default withIntlayer(nextConfig);
