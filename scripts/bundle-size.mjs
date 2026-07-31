// 在 scripts/bundle-size.sh 建好的空白消费方工程里执行：对若干代表性入口各打一次包，
// 量 gzip 体积，与 scripts/size-limits.json 的基线比对。
//
// ## 量的是什么
//
// 每个入口生成一个 `export * from "<入口>"` 的模块，交给 esbuild：
// bundle + splitting + minify + `NODE_ENV=production`，react 全家外部化（消费方本来就有）。
// 于是得到两个数字：
//
//   - **initial** —— 入口自己那个 chunk 的 gzip 字节。这是「用户打开页面时立刻要下载的」，
//     也是门禁真正卡的数字。
//   - **total** —— 全部输出 chunk 的 gzip 之和。懒加载（`import()`）会把代码挪进
//     独立 chunk，total 基本不变而 initial 下降 —— 两个数一起看才分得清
//     「真的删掉了代码」还是「只是推迟了下载」。
//
// 除 react 外一律计入：`@base-ui/react`、`motion`、MUI、recharts、tiptap、vidstack……
// 它们都是消费方装 @hulianui/ui 时真实付出的字节，外部化掉就等于自欺。
//
// CSS 不计入：用 empty loader 吞掉（vidstack 之类会 `import "*.css"`）。
// 瑚琏的样式主体是 Tailwind 工具类 + tokens 里的 CSS 变量，走的是消费方自己的
// Tailwind 产物，与这里的 JS bundle 不是一条链路，混在一起量反而失真。
//
// ## 门禁怎么判
//
// initial 超过 `limitKB` 即失败。基线是「当前实测值 + 余量」，不是理想值 ——
// 它的职责是拦住无意的体积回归，不是逼着谁去优化。
// 优化完记得 `--update` 把基线压回去，否则省下来的空间会被下一次改动悄悄吃掉。
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import * as esbuild from "esbuild";

const UPDATE = process.argv.includes("--update");
// `--why <name>`：把该入口的 bundle 构成打出来（谁占了多少字节）。
// 有了它，「这个组件为什么这么大」不必再靠猜 —— 直接看 esbuild 的归因。
const WHY = (() => {
  const i = process.argv.indexOf("--why");
  return i >= 0 ? process.argv[i + 1] : null;
})();
const LIMITS_PATH = "size-limits.json";
const limits = JSON.parse(readFileSync(LIMITS_PATH, "utf8"));

const SRC_DIR = "entries";
const OUT_DIR = "dist";
rmSync(SRC_DIR, { recursive: true, force: true });
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(SRC_DIR, { recursive: true });

const gzipKB = (buf) => gzipSync(buf, { level: 9 }).length / 1024;

/** 打一个入口，返回 { initialKB, totalKB, chunks }。 */
async function measure(target) {
  const entryFile = join(SRC_DIR, `${target.name}.ts`);
  // `export *` 而不是 import + 用一下：入口的导出是 tree-shaking 的根，
  // 这样量到的是「这个子路径对外暴露的全部东西」，是消费方代价的保守上界。
  writeFileSync(entryFile, `export * from ${JSON.stringify(target.entry)};\n`);

  const outdir = join(OUT_DIR, target.name);
  const result = await esbuild.build({
    entryPoints: [entryFile],
    outdir,
    bundle: true,
    // splitting 是量 initial/total 差值的前提：没有它，懒加载的 import() 会被
    // 内联回主 chunk，lazy 边界的收益完全看不出来。
    splitting: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    metafile: true,
    jsx: "automatic",
    // 不加这条，React 与库里所有 `process.env.NODE_ENV !== "production"` 的
    // 开发期分支（warn-once、is-dev、propTypes 校验）都会留在产物里，体积虚高。
    define: { "process.env.NODE_ENV": '"production"' },
    // 消费方工程自己会提供 react —— 打进来既不真实又会淹没组件本身的体积。
    external: ["react", "react/*", "react-dom", "react-dom/*"],
    // CSS 与静态资源不计入（理由见文件头）。empty loader 会把它们替换成空模块，
    // 既不报错也不贡献字节。
    loader: {
      ".css": "empty",
      ".svg": "empty",
      ".png": "empty",
      ".jpg": "empty",
      ".woff": "empty",
      ".woff2": "empty",
    },
    logLevel: "silent",
  });

  if (WHY === target.name) {
    console.log(`\n▼ ${target.name} 的 bundle 构成（esbuild 归因·未 gzip）\n`);
    console.log(await esbuild.analyzeMetafile(result.metafile, { verbose: false }));
  }

  // 参与打包的模块数 —— 与字节数是两回事，量的是**编译压力**而非下载压力：
  // 打包器要逐个 resolve + parse + transform 这些文件。源码分发的库在这项上格外贵，
  // 而 dev 模式不做 tree-shaking，dev 的模块图只会比这里更大。
  const modules = Object.keys(result.metafile.inputs).length;

  let initialKB = 0;
  let totalKB = 0;
  let chunks = 0;
  for (const [outPath, meta] of Object.entries(result.metafile.outputs)) {
    if (!outPath.endsWith(".js")) continue;
    const kb = gzipKB(readFileSync(outPath));
    totalKB += kb;
    chunks += 1;
    // 判 initial 必须比对「是不是我们写的那个入口文件」，不能只看 entryPoint 字段存不存在：
    // esbuild 给**动态 import 切出来的 chunk 也会标 entryPoint**（那是它自己的动态入口）。
    // 只判有无的话，懒加载 chunk 会被算进 initial —— 于是「把代码挪进懒 chunk」这件事
    // 在门禁上看起来毫无变化，整把尺子就废了。
    const isInitial = meta.entryPoint === entryFile;
    if (isInitial) initialKB += kb;
    if (WHY === target.name) {
      console.log(
        `  ${isInitial ? "▪ initial" : "· lazy   "}  ${kb.toFixed(1).padStart(7)}KB gzip  ${(meta.bytes / 1024).toFixed(1).padStart(7)}KB raw  ${outPath}`,
      );
    }
  }
  return { initialKB, totalKB, chunks, modules };
}

const rows = [];
let failed = 0;

// --why 只跑被追问的那一个入口：归因用不着把全表重打一遍。
const targets = WHY ? limits.targets.filter((t) => t.name === WHY) : limits.targets;
if (WHY && targets.length === 0) {
  console.error(`✗ size-limits.json 里没有名为 ${WHY} 的入口`);
  process.exit(1);
}

for (const target of targets) {
  process.stdout.write(`  打包 ${target.name} …\r`);
  let measured;
  try {
    measured = await measure(target);
  } catch (err) {
    console.error(`\n✗ ${target.name}（${target.entry}）打包失败：`);
    console.error(err.message ?? err);
    process.exitCode = 1;
    continue;
  }
  const { initialKB, totalKB, chunks, modules } = measured;
  const over = !UPDATE && target.limitKB != null && initialKB > target.limitKB;
  if (over) failed += 1;
  if (UPDATE) {
    // 余量 15% 并向上取整到 0.5KB：留出 minify/依赖补丁版本带来的正常抖动，
    // 又不至于宽到放过一次真实回归。
    target.limitKB = Math.ceil(initialKB * 1.15 * 2) / 2;
  }
  rows.push({
    name: target.name,
    initial: initialKB,
    total: totalKB,
    chunks,
    modules,
    limit: target.limitKB,
    over,
  });
}

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
const nameW = Math.max(12, ...rows.map((r) => r.name.length));

console.log(`\n${pad("入口", nameW)}  ${padL("initial", 9)}  ${padL("total", 9)}  ${padL("chunks", 6)}  ${padL("modules", 7)}  ${padL("limit", 8)}`);
console.log("-".repeat(nameW + 49));
for (const r of rows) {
  const flag = r.over ? "  ✗ 超出" : "";
  console.log(
    `${pad(r.name, nameW)}  ${padL(r.initial.toFixed(1) + "KB", 9)}  ${padL(r.total.toFixed(1) + "KB", 9)}  ${padL(r.chunks, 6)}  ${padL(r.modules, 7)}  ${padL((r.limit ?? "-") + "KB", 8)}${flag}`,
  );
}

if (UPDATE) {
  writeFileSync(LIMITS_PATH, `${JSON.stringify(limits, null, 2)}\n`);
  // 工程目录是临时的，把更新后的基线也打到 stdout，方便直接回写仓库。
  console.log(`\n▼ 更新后的 size-limits.json（回写到仓库 scripts/ 下）\n`);
  console.log(readFileSync(LIMITS_PATH, "utf8"));
} else if (failed > 0) {
  console.error(`\n✗ ${failed} 个入口超出体积基线。`);
  console.error(`  确属预期的增长 → 跑 \`bash scripts/bundle-size.sh --update\` 重定基线并在 PR 里说明原因。`);
  process.exitCode = 1;
} else {
  console.log(`\n✓ ${rows.length} 个入口均在体积基线内。`);
}
