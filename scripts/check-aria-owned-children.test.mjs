import assert from "node:assert/strict";
import test from "node:test";
import { findViolations } from "./check-aria-owned-children.mjs";

const lines = (src) => findViolations(src).map((v) => `${v.containerRole}>${v.child}`);

test("PR #395 原型：tablist 里混进 <Link> 被拦下", () => {
  const src = `
    <div role="tablist" aria-label="x">
      {tabs.map((t, i) => (
        <button key={i} role="tab" aria-selected={i === active}>{t}</button>
      ))}
      <Link href="/x">open</Link>
    </div>`;
  assert.deepEqual(lines(src), ["tablist><Link>"]);
});

test("链接挪到 tablist 外面做兄弟就合规", () => {
  const src = `
    <div className="flex flex-col">
      <div role="tablist">
        {tabs.map((t) => <button key={t} role="tab">{t}</button>)}
      </div>
      <Link href="/x">open</Link>
    </div>`;
  assert.deepEqual(lines(src), []);
});

test("小写标签按隐式角色判：listbox 里不带 role 的 <li> 是 listitem，违规", () => {
  const src = `<ul role="listbox">{empty ? <li>无匹配项</li> : items.map((i) => <li key={i} role="option">{i}</li>)}</ul>`;
  assert.deepEqual(lines(src), ["listbox><li>"]);
});

test("role=\"none\" / 无隐式角色的 div、span、label 都透明，往里看", () => {
  const src = `
    <ul role="listbox">
      <li role="none"><button role="option">a</button></li>
      <div><span role="option">b</span></div>
    </ul>`;
  assert.deepEqual(lines(src), []);
});

test("radiogroup 里包着 radio 的 <label> 合规；<input> 角色随 type 推导", () => {
  const src = `
    <span role="radiogroup">
      {items.map((i) => (
        <label key={i}><input type="radio" name="r" /></label>
      ))}
    </span>`;
  assert.deepEqual(lines(src), []);
  assert.deepEqual(lines(`<span role="radiogroup"><input type="text" /></span>`), [
    "radiogroup><input>",
  ]);
});

test("role=\"list\" 里的裸 <li> 是 listitem，合规", () => {
  assert.deepEqual(lines(`<div role="list"><li>a</li><li>b</li></div>`), []);
});

test("表外组件（渲染什么静态看不出来）放过；Button 在表内", () => {
  assert.deepEqual(lines(`<div role="listbox"><OptionGroup /><Empty /></div>`), []);
  assert.deepEqual(lines(`<div role="tablist"><Button>x</Button></div>`), ["tablist><Button>"]);
});

test("role 是表达式、或 {children} 时静态看不出来，放过", () => {
  assert.deepEqual(lines(`<div role="tablist"><a role={r}>x</a>{children}</div>`), []);
});

test("&& / 三元 / 块体 map 的 return 都算直接子元素", () => {
  const src = `
    <div role="menu">
      {open && <a href="/a">a</a>}
      {x ? <div role="menuitem">b</div> : <h3>c</h3>}
      {items.map((i) => { const k = i; return <button key={k}>d</button>; })}
    </div>`;
  assert.deepEqual(lines(src), ["menu><a>", "menu><h3>", "menu><button>"]);
});

test("aria-owned-ok 注释带理由可豁免，不带理由不算", () => {
  const ok = `
    // aria-owned-ok: 演示反例
    <div role="tablist"><a href="/x">x</a></div>`;
  assert.deepEqual(lines(ok), []);
  const bare = `
    // aria-owned-ok:
    <div role="tablist"><a href="/x">x</a></div>`;
  assert.deepEqual(lines(bare), ["tablist><a>"]);
});
