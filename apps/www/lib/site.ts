// 站点 SEO 单一真源（SSOT）。sitemap / robots / metadataBase / canonical 全部读这里。
//
// 为什么写死主站域名而非 env：本站 output:export，同一份 out/ 同时部署到主站与中国镜像
// （hulianui-zh.haloritual.com）。canonical / og:image 必须指向「一个」权威域名，否则两域名
// 互相稀释权重、Google 视作重复内容。选主站为权威域，镜像页 canonical 一律回指主站 → 权重收敛。
export const SITE_URL = "https://hulianui.haloritual.com";
export const SITE_NAME = "瑚琏 Hulian";
export const SITE_TAGLINE = "颜值 + 好用的 React 组件库";
export const SITE_DESCRIPTION =
  "瑚琏 Hulian（hulianui）是一套「颜值即生产力」的 React 组件库与设计系统：内置 349+ 组件，OKLCH 色彩 + Tailwind CSS v4，暗色模式零闪烁、运行时换肤，源码分发、开箱即用。";
