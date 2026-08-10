import assert from "node:assert/strict";
import test from "node:test";

import { findInvalidCandidates } from "./check-tailwind-candidates.mjs";

test("拦下 #141 那条注释：通配自定义属性名", () => {
  const source = `/**
 * **刻意不含圆角**——特效件各自用 \`[border-radius:var(--hulian-*)]\` 之类的自定义圆角，
 */`;
  const hits = findInvalidCandidates(source);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].name, "--hulian-*");
  assert.equal(hits[0].line, 2);
});

test("放行真类名里的 `*`：它在 calc()/conic-gradient() 里，不在 var() 名字内", () => {
  const source = `
    "[animation:hulian-spin-around_calc(var(--hulian-shimmer-speed)*2)_infinite_linear]"
    "[background:conic-gradient(from_calc(270deg-(var(--hulian-shimmer-spread)*0.5)),transparent_0)]"
    "group-hover/sticker:[top:calc(-100%+2*var(--hulian-sticker-hover)-1px)]"
  `;
  assert.deepEqual(findInvalidCandidates(source), []);
});

test("放行带 fallback 的正常写法", () => {
  const source = `"[background:color-mix(in_oklch,var(--color-surface),transparent_calc((1-var(--hulian-glass-frost,0))*100%))]"`;
  assert.deepEqual(findInvalidCandidates(source), []);
});

test("拦下 ASCII 标点占位记号", () => {
  const source = `const a = "[color:var(--hulian-?)]";\nconst b = "[width:var(--hulian-%)]";`;
  assert.deepEqual(
    findInvalidCandidates(source).map((hit) => hit.name),
    ["--hulian-?", "--hulian-%"],
  );
});

// 非 ASCII 码点（≥ U+0080）按 CSS Syntax 规范就是合法的 ident 字符，`var(--hulian-…)`
// 能正常解析、不会炸消费方。本门禁只挡真正解析失败的写法，不做风格审查 ——
// 扩大到「注释里不许出现类名形态」会开始误伤大量正常文档。
test("非 ASCII 记号是合法 ident，不拦", () => {
  assert.deepEqual(findInvalidCandidates(`"[color:var(--hulian-…)]"`), []);
});

test("非方括号形态不算候选 —— 这正是 #141 的修法", () => {
  const source = `* 特效件各自用 var(--hulian-…) 形态的自定义圆角类`;
  assert.deepEqual(findInvalidCandidates(source), []);
});
