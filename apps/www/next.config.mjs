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
