import localFont from "next/font/local";

// 文档站字型（hulianui/hulian#319）。
//
// 为什么走 next/font/local 而不是在 globals.css 里手写 @font-face：本站按语言构建，
// next.config.mjs 里的 basePath 会随 locale 变（中文镜像站带前缀）。CSS 的 url() 不吃
// basePath —— 手写 @font-face 指向 /fonts/*.woff2 的话，带前缀的那份构建全站掉字体，
// 而且掉得很安静（浏览器直接回退系统字体，构建与控制台都不报错）。next/font 在构建期
// 重写路径、生成 preload、并把字体名收进一个 CSS 变量，这三件正好是手写要漏的三件。
//
// 用可变字体而非 9 个静态字重：Geist-Variable 69KB + GeistMono-Variable 71KB 就覆盖了
// Thin–UltraBlack 全档，比按需挑几个静态档还省，且以后想用 500/600 不必再加请求。
//
// fallback 里的中文栈是有意为之：CJK 字体是 MB 级，自托管要 subset + unicode-range 分片，
// 会给静态导出多一道工序和几百个分片文件。西文写在前面、中文落到系统（苹方 / 微软雅黑），
// 英文与数字命中 Geist，中文交给系统 —— 代价是 Windows 与 macOS 的中文观感不一致，
// 这一轮接受（#319 的待定 2）。

export const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "sans-serif",
  ],
});

export const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
