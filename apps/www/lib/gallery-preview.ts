/**
 * 画廊卡要不要上活预览，按分类一刀切。
 *
 * 排除 decoration：装饰件是整屏背景/特效，其中 47 个靠 WebGL —— 浏览器同时可用的
 * GL context 只有十几个，画廊滚过去必然耗尽；而且整屏特效缩进 96px 高的小框里
 * 本来也看不出是什么。这类只在详情页 live。
 *
 * 刻意用「分类」而不是「WebGL 组件清单」做判据：清单要么硬编码 47 个 slug 会漂移，
 * 要么再加一处组件注册点。分类判据零漂移、可解释。
 *
 * 放在 lib/ 而不是跟 ComponentThumbnail 同文件：那个文件是 "use client"，
 * 而这条规则要在 RSC 画廊页里决定「渲不渲染缩略图」。server 不能调 client 模块的
 * 普通函数（只能渲染其组件导出），同放一处会在运行时炸，且 tsc 查不出来。
 */
export function canPreviewCategory(categoryKey: string) {
  return categoryKey !== "decoration";
}
