// react-bits 移植集中拼接 —— 待 BUILD workflow 完成后运行。
// 以「磁盘实际产物」为准（不轻信 agent 自报）：仅当 src/<slug>/index.ts + <slug>.showcase.tsx 双在才接线。
// 幂等：已接线的 slug 不重复插入。
import fs from 'fs';
import path from 'path';

const ROOT = '/Users/zhangzhiwei/Desktop/code/hulian';
const UI = path.join(ROOT, 'packages/ui/src');
const plan = JSON.parse(fs.readFileSync('/tmp/rb-plan-full.json', 'utf8'));
// results: { slug -> {description, keyframes, status} }，由 build 输出写入；缺失则降级
let results = {};
try {
  const arr = JSON.parse(fs.readFileSync('/tmp/rb-results.json', 'utf8'));
  for (const r of (arr.results || arr)) if (r && r.slug) results[r.slug] = r;
} catch { console.warn('no /tmp/rb-results.json — 用降级描述'); }

const esc = (s) => String(s).replace(/"/g, '\\"');
const onDisk = (slug) =>
  fs.existsSync(path.join(UI, slug, 'index.ts')) &&
  fs.existsSync(path.join(UI, slug, `${slug}.showcase.tsx`));

const wired = [], missing = [], keyframesAll = [];
for (const p of plan) {
  if (onDisk(p.slug)) { wired.push(p); const kf = results[p.slug]?.keyframes; if (kf && kf.trim()) keyframesAll.push(kf.trim()); }
  else missing.push(p.slug);
}

// 1) index.ts barrel
{
  const f = path.join(UI, 'index.ts');
  let src = fs.readFileSync(f, 'utf8');
  const anchor = '// 工具 + showcase 约定';
  const add = wired.filter(p => !src.includes(`from "./${p.slug}"`))
    .map(p => `export * from "./${p.slug}";`);
  if (add.length) {
    const block = `// —— react-bits 移植批（自动接线）——\n${add.join('\n')}\n\n${anchor}`;
    src = src.replace(anchor, block);
    fs.writeFileSync(f, src);
  }
  console.log(`index.ts +${add.length}`);
}

// 2) showcase.ts barrel
{
  const f = path.join(UI, 'showcase.ts');
  let src = fs.readFileSync(f, 'utf8');
  const add = wired.filter(p => !src.includes(`/${p.slug}/${p.slug}.showcase`))
    .map(p => `export { ${p.showcaseExport} } from "./${p.slug}/${p.slug}.showcase";`);
  if (add.length) { src = src.replace(/\s*$/, '\n') + add.join('\n') + '\n'; fs.writeFileSync(f, src); }
  console.log(`showcase.ts +${add.length}`);
}

// 3) manifest.ts COMPONENTS
{
  const f = path.join(ROOT, 'apps/www/lib/manifest.ts');
  let src = fs.readFileSync(f, 'utf8');
  const add = wired.filter(p => !src.includes(`slug: "${p.slug}"`)).map(p => {
    const desc = results[p.slug]?.description?.trim() || `${p.name} · React Bits 移植`;
    const tags = p.tags?.length ? `, tags: [${p.tags.map(t => `"${t}"`).join(', ')}]` : '';
    return `  { slug: "${p.slug}", name: "${p.name}", description: "${esc(desc)}", category: "${p.category}", group: "${p.group}"${tags}, status: "new" },`;
  });
  if (add.length) {
    // 插到 COMPONENTS 数组结尾的 "];" 之前（manifest 末尾那个 ]）
    const idx = src.lastIndexOf('\n];');
    src = src.slice(0, idx) + '\n  // —— react-bits 移植批 ——\n' + add.join('\n') + src.slice(idx);
    fs.writeFileSync(f, src);
  }
  console.log(`manifest.ts +${add.length}`);
}

// 4) keyframes → preset.css（集中 append，去重）
if (keyframesAll.length) {
  const f = path.join(ROOT, 'packages/tokens/src/preset.css');
  let css = fs.readFileSync(f, 'utf8');
  const add = keyframesAll.filter(kf => {
    const m = kf.match(/@keyframes\s+([\w-]+)/);
    return m && !css.includes(`@keyframes ${m[1]}`);
  });
  if (add.length) { css = css.replace(/\s*$/, '\n\n') + '/* —— react-bits 移植批 keyframes —— */\n' + add.join('\n\n') + '\n'; fs.writeFileSync(f, css); }
  console.log(`preset.css +${add.length} keyframes`);
}

console.log(`\n接线 ${wired.length}/${plan.length} · 缺失(磁盘无产物): ${missing.length}`);
if (missing.length) console.log('MISSING: ' + missing.join(' '));
fs.writeFileSync('/tmp/rb-missing.json', JSON.stringify(missing));
