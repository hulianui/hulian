import assert from "node:assert/strict";
import test from "node:test";
import { findIssues, gallerySlugs, jsxFragments, mdComponentLinks } from "./check-doc-link-targets.mjs";

// 案例来自 PR #406：CI 的 docs:i18n:links（要先 build 整站）拦下的 12 条 finding。

test("md 链到不进画廊的组件（../theme/theme.md）被找出来", () => {
  const slugs = gallerySlugs(`{ slug: "spotlight", name: "Spotlight" }`);
  const links = mdComponentLinks("[ThemeProvider](../theme/theme.md) · [Spotlight](../spotlight/spotlight.md)");
  assert.deepEqual(
    links.filter((l) => !slugs.has(l.slug)).map((l) => l.slug),
    ["theme"],
  );
});

test("md 链接带锚点 / 同行多条都能认出，非组件文档链接不管", () => {
  const links = mdComponentLinks("见 [A](../a-b/a-b.md#props)、[B](../c/c.md)，外链 [x](https://x.dev/a.md)");
  assert.deepEqual(
    links.map((l) => l.slug),
    ["a-b", "c"],
  );
});

test("showcase 的 href=\"#x\" 没有同文件 id 落点时报出；有落点 / 只是 code 字符串时放过", () => {
  const bad = jsxFragments(`export const s = { render: () => <Tag render={<a href="#changelog" />}>v1</Tag> };`);
  assert.deepEqual(bad.hrefs.map((h) => h.fragment), ["changelog"]);
  assert.equal(bad.ids.has("changelog"), false);

  const ok = jsxFragments(`const r = () => <div id="home"><Brand href="#home" /></div>;`);
  assert.ok(ok.hrefs.every((h) => ok.ids.has(h.fragment)));

  // code: 模板字符串里的 href 不渲染成链接
  const code = jsxFragments("const s = { code: `<a href=\"#zh\" />` };");
  assert.equal(code.hrefs.length, 0);

  // href="#" 是不跳转的占位，不检查
  assert.equal(jsxFragments(`const r = () => <a href="#">x</a>;`).hrefs.length, 0);
});

test("当前仓库无问题", () => {
  assert.deepEqual(findIssues(), []);
});
