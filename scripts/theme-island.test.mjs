// 主题局部覆盖（「岛」）的结构性守卫 —— hulianui/hulian#101。
//
// 这三条断言各自对应一次真实的翻车方式，且都是**静默**的（页面照跑，只是颜色不对）：
//   ① 亮色只挂 :root → 暗页里嵌不了亮色岛（反向可以），主题覆盖单向；
//   ② dark variant 用 `[data-theme="dark"] *` → 亮色岛内部仍匹配，岛内「变量亮、dark: 类暗」撕裂；
//   ③ 改用 `:not([data-theme="light"] *)` 排除 → 反过来杀掉「显式亮页 → 暗岛」，
//      而 ThemeProvider 恰恰会把 light 显式写在 <html> 上，等于每天都在跑的组合被打断。
// 判据只能是「最近的主题祖先」，选择器表达不了「最近」，所以走继承来的 --hl-theme。
// 行为面的双向验收要真实浏览器，这里只钉住结构不被改回去。

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const semantic = readFileSync(join(ROOT, "packages", "tokens", "src", "semantic.css"), "utf8");
// dark variant 自 #166 起住在主张层（preset.css 只是聚合入口）。
const preset = readFileSync(join(ROOT, "packages", "tokens", "src", "preset-opinionated.css"), "utf8");

test("亮色是一个可选择的主题，而不只是根默认值", () => {
  assert.match(
    semantic,
    /^:root,\n\[data-theme="light"\] \{/m,
    '亮色块必须同时挂 :root 与 [data-theme="light"]，否则暗页里嵌不了亮色岛',
  );
});

test("两个主题块都声明 --hl-theme，dark variant 才有判据可查", () => {
  const lightBlock = semantic.slice(
    semantic.indexOf(':root,\n[data-theme="light"] {'),
    semantic.indexOf('[data-theme="dark"] {'),
  );
  assert.match(lightBlock, /--hl-theme:\s*light;/);
  assert.match(semantic.slice(semantic.indexOf('[data-theme="dark"] {')), /--hl-theme:\s*dark;/);
});

test("dark variant 按最近主题祖先判定，不用祖先选择器", () => {
  // 从**至规则本身**起切（文件顶部注释里也写着 "@custom-variant dark" 这几个字），
  // 终点同理要从起点之后再找 @theme，否则会切到长度为负的空串。
  const start = preset.indexOf("@custom-variant dark {");
  assert.notEqual(start, -1, "@custom-variant dark 必须留在主张层 preset-opinionated.css 里");
  const variant = preset.slice(start, preset.indexOf("@theme", start));
  assert.match(variant, /@container style\(--hl-theme: dark\)/, "必须查 --hl-theme（最近祖先胜出）");
  assert.match(variant, /&:where\(\[data-theme="dark"\]\)/, "岛根自身要单独兜（@container 查的是父容器）");
  assert.doesNotMatch(
    variant,
    /\[data-theme="dark"\]\s+\*/,
    '后代选择器会漏进亮色岛内部（#101 的第二半）',
  );
});

// ===== preset 三分（hulianui/hulian#166）=====
// 核心层的卖点是「纯加法，任何存量项目都能先引这一份」。这条卖点是**靠内容成立的**：
// 一旦有人图省事把 dark variant / 阴影 / 缓动挪回核心层，卖点当场失效，而且照样构建成功。
// 聚合入口那一条同样是承诺：现存消费方写的 preset.css 必须仍等于「核心 + 主张」。
test("preset 三分：核心层不得含任何全局接管", () => {
  const core = readFileSync(join(ROOT, "packages", "tokens", "src", "preset-core.css"), "utf8");
  assert.doesNotMatch(core, /@custom-variant/, "dark variant 属主张层：会覆盖消费方自己的定义");
  assert.doesNotMatch(core, /--shadow-(sm|md|lg|xl|2xl):/, "阴影重绑属主张层：改变所有 shadow-* 外观");
  assert.doesNotMatch(core, /--ease-out:|--default-transition-timing-function:/, "缓动重绑属主张层");
});

test("preset.css 仍是聚合入口（现存消费方的 @import 行为不变）", () => {
  const aggregate = readFileSync(join(ROOT, "packages", "tokens", "src", "preset.css"), "utf8");
  assert.match(aggregate, /@import "\.\/preset-core\.css";/);
  assert.match(aggregate, /@import "\.\/preset-opinionated\.css";/);
});
