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
// 中文由自托管的思源黑体承担（Noto Sans SC，OFL-1.1，97 个 unicode-range 分片，
// 见同目录 noto-sans-sc.css）。它在 fallback 数组里必须排在 ui-sans-serif / system-ui
// **之前** —— 那几个通用族对中文字符会直接命中系统中文字体（苹方 / 微软雅黑），
// 排在它们后面的 Noto 永远轮不到，自托管等于白做。
// 排在最后的系统中文栈是兜底：Noto 未覆盖的生僻字仍然有字可用。

export const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: [
    "Noto Sans SC",
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
  // 等宽里的中文（代码块里的注释）同样交给 Noto Sans SC —— 中文没有真正的等宽版，
  // 但至少与正文同一副字，不会在一段代码里冒出第三种字形。
  fallback: [
    "Noto Sans SC",
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Consolas",
    "monospace",
  ],
});
