// 在 scripts/compile-cost.sh 建好的消费方工程里执行：量 Vite dev 的编译压力。
//
// ## 为什么不能拿 bundle-size 的数字代替
//
// dev **不做 tree-shaking**（webpack 的 usedExports/sideEffects 只在 production 开，
// Vite dev 则是按请求逐模块 transform，压根没有打包这一步）。所以 prod 产物里被剪掉的东西
// 在 dev 里全都要 resolve、parse、transform，并常驻在模块图里。
// 消费者抱怨的「dev server 吃 3 GB、HMR 卡到点了没反应」量的是这个，不是产物字节。
//
// ## 怎么量的
//
// 用 Vite 的 JS API 起一个真实 dev server，然后 `ssrLoadModule` 入口文件 ——
// 它会**递归 transform 整棵依赖图**，与浏览器打开页面时发生的事情等价，
// 但不需要真浏览器，因而可重复、可进 CI。随后读三个数：
//
//   - **模块数** `server.moduleGraph.idToModuleMap.size` —— dev 模块图的常驻规模
//   - **耗时** ssrLoadModule 的墙钟时间 —— 冷启动首屏要等多久
//   - **峰值 RSS** 采样 `process.memoryUsage().rss` —— dev server 的内存水位
//
// 每个场景用**独立的 server 实例**并在之间强制 GC，否则前一个场景的模块图会算进后一个。
//
// ## 一个诚实的边界
//
// ssrLoadModule 会真的执行模块。少数组件在模块顶层碰浏览器 API 时会抛错 ——
// 那不影响测量：抛错发生在 transform 之后，模块图与内存开销已经产生了。
// 脚本记录失败数但不因此中断，因为我们量的是编译成本，不是运行时可用性。
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync } from "node:fs";

// 一个典型中后台页面会用到的组件集 —— 场景之间必须用**同一组组件**，
// 否则比较的就不是引入方式而是用量。
const COMPONENTS = [
  ["Button", "button"],
  ["Card", "card"],
  ["Tag", "tag"],
  ["Dialog", "dialog"],
  ["Select", "select"],
  ["Table", "table"],
  ["Tabs", "tabs"],
  ["Tooltip", "tooltip"],
];

const SCENARIOS = [
  {
    name: "根 barrel",
    note: "import { Button, Card, … } from '@hulianui/ui'",
    source: `import { ${COMPONENTS.map(([n]) => n).join(", ")} } from "@hulianui/ui";\nexport const used = [${COMPONENTS.map(([n]) => n).join(", ")}];\n`,
  },
  {
    name: "子路径",
    note: "import { Button } from '@hulianui/ui/button' …（逐个）",
    source: `${COMPONENTS.map(([n, p]) => `import { ${n} } from "@hulianui/ui/${p}";`).join("\n")}\nexport const used = [${COMPONENTS.map(([n]) => n).join(", ")}];\n`,
  },
  {
    name: "单个轻组件",
    note: "import { Card } from '@hulianui/ui/card'（地板值）",
    source: `import { Card } from "@hulianui/ui/card";\nexport const used = [Card];\n`,
  },
];

mkdirSync("src", { recursive: true });

/** 采样自身 RSS 峰值 —— dev server 与本进程同进程，读自己就够。 */
function startRssSampler() {
  let peak = process.memoryUsage().rss;
  const timer = setInterval(() => {
    const rss = process.memoryUsage().rss;
    if (rss > peak) peak = rss;
  }, 20);
  timer.unref?.();
  return {
    stop() {
      clearInterval(timer);
      return peak;
    },
  };
}

const results = [];

for (const scenario of SCENARIOS) {
  const entry = `src/entry-${results.length}.tsx`;
  writeFileSync(entry, scenario.source);

  // 每个场景一个全新 server：模块图、transform 缓存、optimizeDeps 结果都不共享。
  const server = await createServer({
    root: process.cwd(),
    logLevel: "silent",
    plugins: [react()],
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  // 基线在 server 建好之后取：把 Vite 自身的常驻开销从组件的账上摘出去。
  global.gc?.();
  const rssBefore = process.memoryUsage().rss;
  const sampler = startRssSampler();
  const t0 = performance.now();

  let failed = 0;
  try {
    await server.ssrLoadModule(`/${entry}`);
  } catch {
    failed += 1; // 顶层碰浏览器 API 的模块会在这里抛 —— transform 已完成，不影响计量
  }

  const ms = performance.now() - t0;
  const peakRss = sampler.stop();
  const modules = server.moduleGraph.idToModuleMap.size;

  await server.close();
  global.gc?.();

  results.push({
    name: scenario.name,
    note: scenario.note,
    modules,
    ms,
    deltaMB: (peakRss - rssBefore) / 1024 / 1024,
    failed,
  });
  process.stdout.write(`  ${scenario.name} … ${modules} 模块\n`);
}

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
const w = Math.max(12, ...results.map((r) => r.name.length + 2));

console.log(`\n${pad("场景", w)}  ${padL("模块数", 8)}  ${padL("transform", 10)}  ${padL("内存增量", 10)}`);
console.log("-".repeat(w + 36));
for (const r of results) {
  console.log(
    `${pad(r.name, w)}  ${padL(r.modules, 8)}  ${padL(r.ms.toFixed(0) + "ms", 10)}  ${padL(r.deltaMB.toFixed(0) + "MB", 10)}`,
  );
}
console.log("");
for (const r of results) console.log(`  ${r.name}：${r.note}`);

const barrel = results[0];
const subpath = results[1];
if (barrel && subpath) {
  const modRatio = (barrel.modules / Math.max(subpath.modules, 1)).toFixed(1);
  const memRatio = (barrel.deltaMB / Math.max(subpath.deltaMB, 0.1)).toFixed(1);
  console.log(
    `\n▪ 同样 8 个组件：根 barrel 的模块数是子路径的 ${modRatio} 倍，内存 ${memRatio} 倍。`,
  );
}

// ── 第二把尺子：类型检查 ────────────────────────────────────────────────
//
// 打包器的负担能靠 optimizeDeps / optimizePackageImports 卸掉（两者都会把源码树
// 塌缩成预打包产物），但 **tsserver 吃不到那个好处** —— IDE 里的类型检查永远直面
// 我们发出去的 .tsx 源码，`skipLibCheck` 也只跳 .d.ts、跳不过源码。
// 所以「IDE 卡」和「dev server 卡」是两个独立的问题，得分开量。
console.log(`\n▶ 类型检查成本（tsc --extendedDiagnostics）`);

mkdirSync("tsprobe", { recursive: true });
writeFileSync(
  "tsconfig.probe-base.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
    },
    null,
    2,
  ),
);

// 刻意只 import **一个**组件：量的是「引入方式」的固定成本，不是用量。
const TS_CASES = [
  { name: "根 barrel", src: 'import { Button } from "@hulianui/ui";\nexport const A = <Button>x</Button>;\n' },
  { name: "子路径", src: 'import { Button } from "@hulianui/ui/button";\nexport const B = <Button>x</Button>;\n' },
];

const { execFileSync } = await import("node:child_process");
const tsRows = [];
for (const [i, c] of TS_CASES.entries()) {
  const file = `tsprobe/case-${i}.tsx`;
  writeFileSync(file, c.src);
  writeFileSync(
    `tsconfig.probe-${i}.json`,
    JSON.stringify({ extends: "./tsconfig.probe-base.json", include: [file] }, null, 2),
  );
  let out = "";
  try {
    out = execFileSync("./node_modules/.bin/tsc", ["-p", `tsconfig.probe-${i}.json`, "--extendedDiagnostics"], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 32,
    });
  } catch (err) {
    // tsc 报类型错误时退出码非 0，但诊断数据照样在 stdout 上 —— 我们要的是那个。
    out = err.stdout ?? "";
  }
  const pick = (label) => {
    const m = out.match(new RegExp(`^${label}:\\s+(.+)$`, "m"));
    return m ? m[1].trim() : "?";
  };
  tsRows.push({
    name: c.name,
    files: pick("Files"),
    memory: pick("Memory used"),
    total: pick("Total time"),
  });
}

const tw = Math.max(10, ...tsRows.map((r) => r.name.length + 2));
console.log(`\n${pad("引入方式", tw)}  ${padL("Files", 8)}  ${padL("内存", 10)}  ${padL("总耗时", 9)}`);
console.log("-".repeat(tw + 33));
for (const r of tsRows) {
  const mem = /^(\d+)K$/.test(r.memory)
    ? `${Math.round(Number(r.memory.slice(0, -1)) / 1024)}MB`
    : r.memory;
  console.log(`${pad(r.name, tw)}  ${padL(r.files, 8)}  ${padL(mem, 10)}  ${padL(r.total, 9)}`);
}
console.log(
  `\n▪ 只 import 一个 Button 时的固定成本。这一层 optimizeDeps / optimizePackageImports 都救不了 ——\n` +
    `  它们只塌缩打包器看到的模块图，tsserver 照样直面源码。子路径引入是唯一同时救两边的手段。`,
);
