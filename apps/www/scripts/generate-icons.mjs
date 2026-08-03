/**
 * 瑚琏 icon 生成器 —— 点阵礼器（簋）侧影
 * 运行：node apps/www/scripts/generate-icons.mjs
 *
 * 产物：
 *   app/icon.svg                         favicon（实心剪影 + 底板 + prefers-color-scheme 明暗）
 *   public/logo.svg                      站内顶栏 logo（**无底板**，理由见下方生成处）
 *   scripts/icon-sources/apple-icon.svg  apple-icon 源（实心暗底）→ 栅格化为 app/apple-icon.png 180²
 *   scripts/icon-sources/opengraph.svg   OG 源（满网格 hero）→ 栅格化为 app/opengraph-image.png 1200×630
 *
 * 栅格化（macOS）：
 *   qlmanage -t -s 180 -o apps/www/app apps/www/scripts/icon-sources/apple-icon.svg   # 重命名 *.png → apple-icon.png
 *   Chrome --headless --force-device-scale-factor=2 --window-size=1200,630 \
 *     --screenshot=apps/www/app/opengraph-image.png file://.../opengraph.html         # img 包 opengraph.svg
 *
 * 改轮廓：直接调下面的 body / handles 网格（19×19，列 0..18），重跑即可。
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const COLS = 19, ROWS = 19;
// 礼器主体：每行 [起列, 止列]（含）
const body = {
  3: [4, 14], 4: [4, 14],            // 唇口
  5: [6, 12],                         // 束颈
  6: [4, 14],                         // 肩
  7: [3, 15], 8: [3, 15],            // 鼓腹
  9: [4, 14], 10: [5, 13],           // 收腹
  11: [7, 11],                        // 短茎
  12: [5, 13], 13: [5, 13], 14: [6, 12], // 圈足
};
// 双环耳（留 1 列空隙与腹身分离）
const handles = [
  [6, 2], [6, 16],
  [7, 1], [7, 2], [7, 16], [7, 17],
  [8, 1], [8, 2], [8, 16], [8, 17],
  [9, 2], [9, 16],
];
const on = new Set();
for (const [r, [a, b]] of Object.entries(body)) for (let c = a; c <= b; c++) on.add(`${r},${c}`);
for (const [r, c] of handles) on.add(`${r},${c}`);

const gridGroup = (P, gridDot, bright) => {
  const d = P * 0.6, r = d * 0.3, off = (P - d) / 2;
  let s = "";
  for (let R = 0; R < ROWS; R++) for (let C = 0; C < COLS; C++) {
    const lit = on.has(`${R},${C}`);
    s += `<rect x="${(C * P + off).toFixed(1)}" y="${(R * P + off).toFixed(1)}" width="${d.toFixed(1)}" height="${d.toFixed(1)}" rx="${r.toFixed(1)}" fill="${lit ? bright : gridDot}"/>`;
  }
  return s;
};
const solidRects = (P, ox = 0, oy = 0) =>
  [...on].map((k) => { const [R, C] = k.split(",").map(Number); return `<rect x="${ox + C * P}" y="${oy + R * P}" width="${P}" height="${P}"/>`; }).join("");

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "../app");
const publicDir = resolve(here, "../public");
const srcDir = resolve(here, "icon-sources");
const P = 60, W = COLS * P;

// 1) favicon —— 带底板。
// 它只显示在**浏览器 UI**（标签页、书签栏、历史）里，那里的配色与操作系统主题同源，
// 所以 prefers-color-scheme 判断是准的，底板不会与背景打架；有底板也更像一枚 app 图标。
writeFileSync(resolve(appDir, "icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
<style>.tile{fill:#F6F7F9}.glyph{fill:#2f5be0}@media(prefers-color-scheme:dark){.tile{fill:#0B0E14}.glyph{fill:#5b83ff}}</style>
<rect class="tile" width="${W}" height="${W}" rx="${(W * 0.22).toFixed(0)}"/>
<g class="glyph" shape-rendering="crispEdges">${solidRects(P)}</g>
</svg>`);

// 2) 站内顶栏 logo —— **不带底板**，与 favicon 的唯一差别。
//
// 顶栏用 `<img src="/logo.svg">` 引它（site-navbar.tsx），而 `<img>` 里的 SVG 是**独立文档**：
// 读不到站点的 `data-theme`，只认操作系统的 prefers-color-scheme。站点主题可被用户手动切换、
// 与系统脱钩，一旦错位（系统暗色 + 站点亮色）底板就成了白色导航栏上的一块黑方块；反向错位
// 则是黑导航栏上的白方块。去掉底板，glyph 直接贴导航栏背景，错位时最坏只是蓝色深浅不同。
//
// 保留 glyph 的明暗两档：多数用户站点主题与系统一致，这一档能让 logo 跟着深浅走。
writeFileSync(resolve(publicDir, "logo.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
<style>.glyph{fill:#2f5be0}@media(prefers-color-scheme:dark){.glyph{fill:#5b83ff}}</style>
<g class="glyph" shape-rendering="crispEdges">${solidRects(P)}</g>
</svg>`);

// 3) apple-icon 源（实心暗底）
writeFileSync(resolve(srcDir, "apple-icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="${W}" height="${W}" rx="${(W * 0.22).toFixed(0)}" fill="#0B0E14"/><g shape-rendering="crispEdges" fill="#5b83ff">${solidRects(P)}</g></svg>`);

// 4) OG 源（满网格 hero）
{
  const OW = 1200, OH = 630, tp = 22, gW = COLS * tp, ix = 120, iy = (OH - gW) / 2;
  writeFileSync(resolve(srcDir, "opengraph.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OW} ${OH}" width="${OW}" height="${OH}">
<rect width="${OW}" height="${OH}" fill="#0B0E14"/>
<rect x="${ix}" y="${iy}" width="${gW}" height="${gW}" rx="${(gW * 0.22).toFixed(0)}" fill="#11151f"/>
<g transform="translate(${ix},${iy})">${gridGroup(tp, "#1b2231", "#4f7bff")}</g>
<text x="${ix + gW + 80}" y="295" font-family="ui-serif,'Songti SC',serif" font-size="96" font-weight="700" fill="#F6F7F9">瑚琏 Hulian</text>
<text x="${ix + gW + 82}" y="360" font-family="ui-sans-serif,system-ui,sans-serif" font-size="38" fill="#9aa4b8">颜值 + 好用的 React 设计系统</text>
</svg>`);
}
console.log("app/icon.svg + public/logo.svg + icon-sources/{apple-icon,opengraph}.svg 已生成");
