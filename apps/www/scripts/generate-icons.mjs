/**
 * 瑚琏 icon 生成器 —— 点阵礼器（簋）侧影
 * 运行：node apps/www/scripts/generate-icons.mjs
 *
 * 产物：
 *   app/icon.svg                         favicon（实心剪影 + prefers-color-scheme 明暗）
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
const srcDir = resolve(here, "icon-sources");
const P = 60, W = COLS * P;

// 1) favicon
writeFileSync(resolve(appDir, "icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
<style>.tile{fill:#F6F7F9}.glyph{fill:#2f5be0}@media(prefers-color-scheme:dark){.tile{fill:#0B0E14}.glyph{fill:#5b83ff}}</style>
<rect class="tile" width="${W}" height="${W}" rx="${(W * 0.22).toFixed(0)}"/>
<g class="glyph" shape-rendering="crispEdges">${solidRects(P)}</g>
</svg>`);

// 2) apple-icon 源（实心暗底）
writeFileSync(resolve(srcDir, "apple-icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="${W}" height="${W}" rx="${(W * 0.22).toFixed(0)}" fill="#0B0E14"/><g shape-rendering="crispEdges" fill="#5b83ff">${solidRects(P)}</g></svg>`);

// 3) OG 源（满网格 hero）
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
console.log("icon.svg + icon-sources/{apple-icon,opengraph}.svg 已生成");
