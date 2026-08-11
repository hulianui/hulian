// 消费项目探测。
//
// 没有这一步，每个会话都要重新 grep 一遍对方仓库才敢下笔：装的是哪个版本、跑 Next 还是 Vite、
// token CSS 引没引、ThemeProvider 在哪、该走根 barrel 还是子路径。这些答案全都写在
// 几个固定位置的配置文件里，让 MCP 一次读完，比让模型自己翻便宜得多。
//
// 边界（安全 > 完整）：
//   · 只读**已知路径**的配置文件，不递归遍历仓库
//   · 绝不读 .env / 凭证类文件
//   · 只读不写
//   · 「没在扫描范围里看到」不等于「不存在」—— 一律标 unknown，并把扫过的路径回报出去

import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const HULIAN_PACKAGES = ["@hulianui/ui", "@hulianui/tokens", "@hulianui/guard", "@hulianui/mcp"];

/** 组件树入口的候选位置。命中即停，不做全仓扫描。 */
const ENTRY_CANDIDATES = [
  "app/layout.tsx",
  "app/layout.jsx",
  "src/app/layout.tsx",
  "src/app/layout.jsx",
  "app/providers.tsx",
  "src/app/providers.tsx",
  "src/providers.tsx",
  "src/main.tsx",
  "src/main.jsx",
  "src/App.tsx",
  "src/App.jsx",
  "src/index.tsx",
  "pages/_app.tsx",
  "src/pages/_app.tsx",
];

/**
 * 全局样式表的候选位置（token CSS 与 @source 扫描都写在这儿）。
 *
 * 这只是**兜底**：固定列表必漏 —— `src/styles.css` 这种 Vite 常见命名当初就不在表里，
 * 于是接入完全正确的项目被报成 `unknown`（#46）。真正的判据是 `cssFromEntries()`：
 * 跟着入口文件的 `import "./xxx.css"` 走，文件叫什么、放在哪都能命中。
 */
const CSS_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "src/main.css",
  "src/App.css",
  "src/styles.css",
  "src/globals.css",
  "src/global.css",
  "src/styles/index.css",
  "src/styles/main.css",
  "app/global.css",
];

const CONFIG_CANDIDATES = {
  next: ["next.config.mjs", "next.config.js", "next.config.ts", "next.config.cjs"],
  vite: ["vite.config.ts", "vite.config.js", "vite.config.mts", "vite.config.mjs"],
  vitest: ["vitest.config.ts", "vitest.config.js", "vitest.config.mts", "vitest.config.mjs"],
  tailwind: ["tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs"],
  components: ["components.json"],
  tsconfig: ["tsconfig.json"],
};

const LOCKFILES = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "package-lock.json": "npm",
  "bun.lockb": "bun",
  "bun.lock": "bun",
};

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
};

const readTextIfExists = (path) => {
  try {
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  } catch {
    return null;
  }
};

const firstExisting = (root, candidates) =>
  candidates.map((rel) => ({ rel, abs: join(root, rel) })).find(({ abs }) => existsSync(abs)) ?? null;

/**
 * projectRoot 的来源优先级：显式入参 > MCP Roots > 进程 cwd。
 * 用 cwd 是最后的兜底 —— stdio 起的 server，cwd 未必是消费项目，所以必须把来源标出来。
 */
export function resolveProjectRoot({ explicit, roots = [], cwd = process.cwd() }) {
  if (explicit) {
    const path = isAbsolute(explicit) ? explicit : resolve(cwd, explicit);
    if (!existsSync(path)) throw new Error(`projectRoot 不存在：${path}`);
    return { projectRoot: path, projectRootSource: "argument" };
  }
  for (const root of roots) {
    const uri = typeof root === "string" ? root : root?.uri;
    if (typeof uri !== "string" || !uri.startsWith("file://")) continue;
    const path = decodeURIComponent(uri.slice("file://".length));
    if (existsSync(path)) return { projectRoot: path, projectRootSource: "mcp-roots" };
  }
  return { projectRoot: cwd, projectRootSource: "cwd-fallback" };
}

/** 实装版本以 node_modules 里的 package.json 为准；声明范围只是意图，未必是现实。 */
export function installedVersion(root, name, declared = null) {
  let dir = root;
  for (let depth = 0; depth < 4; depth += 1) {
    const nodeModules = join(dir, "node_modules");
    const entry = join(nodeModules, name);
    const manifest = readJson(join(entry, "package.json"));
    if (manifest?.version) {
      const linkKind = linkKindOf(nodeModules, entry, declared);
      return { version: manifest.version, linkKind, linked: Boolean(linkKind), from: entry };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * 「是不是本地源码接入」**不能**用 `lstat().isSymbolicLink()` 判 —— pnpm 的
 * `node_modules/` 每一项都是指向 `.pnpm/` store 的软链，那样判会在**任何 pnpm 项目**里
 * 对**任何包**恒为 true（#45）。后果不是多一条误报，而是 `!info.linked` 那道版本漂移门禁
 * 对 pnpm 用户整体静默失效 —— 而 pnpm 恰恰是本库文档推荐的包管理器。
 *
 * 两条独立判据，任一成立即算本地接入：
 *   · 声明的 specifier 是 `workspace:` / `link:` / `file:` —— 那是使用者写下的真实意图
 *   · 解析后的真实路径**逃出了所有 node_modules 树** —— pnpm store 的 realpath 仍在某层树内，
 *     指向兄弟仓或 workspace 包则哪层都不在
 *
 * 第二条的基准是**沿途每一层** node_modules，不是发现该包的那一层（#68）：
 * pnpm workspace 子项目里 `apps/web/node_modules/@hulianui/ui` 指向的是**仓库根**的
 * `node_modules/.pnpm/…`，天然「逃出」了 apps/web 那层 —— 只比对发现层会把每个 workspace
 * 子项目里的普通 registry 包都判成 local-link，版本漂移门禁又一次静默失效。
 * 单包项目下 `.pnpm` 恰好与发现层同级，所以 #45 的回归测试当时能过，缺陷藏了下来。
 *
 * workspace 与 link/file 语义不同（前者是 monorepo 内的一等公民，后者是临时联调），
 * 分开标注，调用方按需区分；两者都不该参与「声明 vs 实装」的漂移比对。
 */
function linkKindOf(nodeModulesDir, entry, declared) {
  const spec = typeof declared === "string" ? declared.trim() : "";
  if (spec.startsWith("workspace:")) return "workspace";
  if (spec.startsWith("link:") || spec.startsWith("file:")) return "local-link";
  try {
    const real = realpathSync(entry);
    // 从该 node_modules 的宿主目录一路向上，任一层的 node_modules 收得住就不算本地接入。
    let dir = dirname(nodeModulesDir);
    for (;;) {
      const candidate = join(dir, "node_modules");
      if (existsSync(candidate)) {
        const base = realpathSync(candidate);
        if (real === base || real.startsWith(base + sep)) return null;
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return "local-link";
  } catch {
    // 读不到就当不是：宁可漏报一次联调，也不能把 pnpm store 软链误判成联调
    return null;
  }
}

/**
 * 0.x 的兼容单位是 **minor 而非 major** —— npm 对 `^0.5.0` 只放行 `0.5.x`。
 * 原先只比 major，对瑚琏这种长期停在 0.x 的库永远比不出漂移（`^0.5.0` 与实装 `0.16.0`
 * 两边 major 都是 "0"），门禁常年空转。这与 #45 的 `linked` 恒 true 是两个独立成因，
 * 叠在一起才让「声明 ^0.14.0 却实装 0.16.0」一路无声通过。
 *
 * 只对 `^` / `~` / 精确版本三种形态下判断：`>=x` `*` `1.x` `npm:` 这些要么显式放宽了范围、
 * 要么不是语义版本，猜了就是误报。
 */
function versionDrift(declared, installed) {
  if (!/^\s*[\^~]?\s*\d+\.\d+/.test(declared)) return null;
  const want = declared.replace(/^[\s\^~]+/, "").split(".");
  const got = String(installed).split(".");
  const isNum = (value) => /^\d+$/.test(value ?? "");
  if (!isNum(want[0]) || !isNum(got[0])) return null;
  if (want[0] !== got[0]) return "主版本不一致";
  if (want[0] === "0" && isNum(want[1]) && isNum(got[1]) && want[1] !== got[1]) {
    return "0.x 下 minor 就是破坏性版本线（^ 只放行 patch），实装的不是声明的那条线";
  }
  return null;
}

/**
 * monorepo 根往往**不是**前端项目：5069tk 的 Next 应用在 `web/`，仓库根连 package.json 都没有。
 * MCP Roots 给的是仓库根，直接照单全收就会得出「没装 @hulianui/ui」这种错误结论。
 *
 * 这里做**有界**的候选探测：先认 workspace 声明（pnpm-workspace.yaml / package.json workspaces），
 * 没有再试一组常见目录名。只看一层、只认有 package.json 的目录，不递归扫全仓库；
 * 也**不自动改用**候选 —— 只把候选交出来，由 agent/用户确认后带 projectRoot 再调一次。
 */
const WORKSPACE_DIR_GUESSES = ["web", "frontend", "client", "site", "www", "app", "ui", "admin"];
const MAX_CANDIDATES = 12;

function workspaceGlobs(root) {
  const globs = [];
  const pkg = readJson(join(root, "package.json"));
  if (Array.isArray(pkg?.workspaces)) globs.push(...pkg.workspaces);
  else if (Array.isArray(pkg?.workspaces?.packages)) globs.push(...pkg.workspaces.packages);
  const yaml = readTextIfExists(join(root, "pnpm-workspace.yaml"));
  if (yaml) {
    for (const match of yaml.matchAll(/^\s*-\s*["']?([^"'\n#]+)["']?\s*$/gm)) globs.push(match[1].trim());
  }
  return globs;
}

/** 把 `apps/*` 这类一层通配展开成真实目录；不支持 `**`（那就是递归扫仓库了）。 */
function expandGlob(root, glob) {
  const clean = glob.replace(/^\.\//, "").replace(/\/$/, "");
  if (clean.includes("**") || clean.startsWith("!")) return [];
  if (!clean.includes("*")) return [clean];
  const [prefix, rest] = clean.split("*");
  if (rest && rest !== "") return [];
  const dir = join(root, prefix);
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => `${prefix}${entry.name}`);
  } catch {
    return [];
  }
}

function workspaceCandidates(root) {
  const globs = workspaceGlobs(root);
  const relatives = globs.length
    ? [...new Set(globs.flatMap((glob) => expandGlob(root, glob)))]
    : WORKSPACE_DIR_GUESSES;
  const found = [];
  for (const rel of relatives) {
    if (found.length >= MAX_CANDIDATES) break;
    const dir = join(root, rel);
    const pkg = readJson(join(dir, "package.json"));
    if (!pkg) continue;
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    const installed = installedVersion(dir, "@hulianui/ui", deps["@hulianui/ui"]);
    found.push({
      path: rel,
      framework: detectFramework(deps).name,
      hulianUi: installed?.version ?? deps["@hulianui/ui"] ?? null,
    });
  }
  // 装了瑚琏的排前面 —— 那才是这个 server 有话可说的项目
  return found.sort((a, b) => Number(Boolean(b.hulianUi)) - Number(Boolean(a.hulianUi)));
}

function detectFramework(deps) {
  if (deps.next) return { name: "next", version: deps.next };
  if (deps.astro) return { name: "astro", version: deps.astro };
  if (deps["@remix-run/react"]) return { name: "remix", version: deps["@remix-run/react"] };
  if (deps.vite) return { name: "vite", version: deps.vite };
  if (deps["react-scripts"]) return { name: "cra", version: deps["react-scripts"] };
  return { name: "unknown", version: null };
}

/**
 * 从入口文件里抓出它 import 的本项目 CSS —— 这比固定候选列表可靠得多：
 * `src/main.tsx` 里那行 `import "./styles.css"` 直接指出了真正的全局样式表，
 * 无论它叫什么名字、放在哪个目录（#46）。
 *
 * 只认相对路径：裸 specifier（`import "tailwindcss"`）指向 node_modules，不是本项目的样式表；
 * 顺着 `../..` 爬出 projectRoot 的也丢掉 —— 探测必须留在本仓库边界内。
 */
function cssFromEntries(root) {
  const found = [];
  for (const rel of ENTRY_CANDIDATES) {
    const text = readTextIfExists(join(root, rel));
    if (text === null) continue;
    for (const [, spec] of text.matchAll(/import\s+["']([^"']+\.css)["']/g)) {
      if (!spec.startsWith(".")) continue;
      const abs = resolve(dirname(join(root, rel)), spec);
      if (!abs.startsWith(root + sep)) continue;
      found.push(relative(root, abs).split(sep).join("/"));
    }
  }
  return [...new Set(found)];
}

/** 在候选文件里找一个标记；找不到只说「扫过的文件里没有」，不说「不存在」。 */
function probe(root, candidates, pattern) {
  const scanned = [];
  for (const rel of candidates) {
    const abs = join(root, rel);
    const text = readTextIfExists(abs);
    if (text === null) continue;
    scanned.push(rel);
    if (pattern.test(text)) return { status: "detected", file: rel, scanned };
  }
  return { status: scanned.length ? "not-found" : "unknown", file: null, scanned };
}


/**
 * 解析 CSS 里的 `@source "<路径>"`，逐条把目标解析成绝对路径并检查是否存在。
 *
 * 只按文本匹配「有没有写 @source」是不够的（hulianui/hulian#66）：pnpm workspace 里
 * 真实包入口可能在 `apps/web/node_modules`，而 CSS 写的是 `../../../node_modules/...`，
 * 解析后根本不存在 —— 于是 setup 表面全绿、构建也成功，但库内 Tailwind 工具类一个都没生成，
 * 页面退化成无样式文本，typecheck / 单测 / guard 全都发现不了。
 *
 * glob 只取静态前缀（第一个含 * 的段之前），足够判断「这条路径指对了没有」。
 */
export function resolveSourceTargets(cssAbsPath, cssText) {
  const dir = dirname(cssAbsPath);
  const out = [];
  const re = /@source\s+(?:not\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(cssText))) {
    const raw = m[1];
    if (!raw.includes("@hulianui/ui")) continue;
    const staticPrefix = raw.split("/").reduce((acc, seg) => {
      if (acc.stop || seg.includes("*")) return { parts: acc.parts, stop: true };
      return { parts: [...acc.parts, seg], stop: false };
    }, { parts: [], stop: false }).parts.join("/");
    const abs = isAbsolute(staticPrefix) ? staticPrefix : resolve(dir, staticPrefix);
    out.push({ raw, resolved: abs, exists: existsSync(abs) });
  }
  return out;
}

export function inspectProject({ explicit, roots, cwd } = {}) {
  const { projectRoot, projectRootSource } = resolveProjectRoot({ explicit, roots, cwd });
  const warnings = [];

  const pkg = readJson(join(projectRoot, "package.json"));
  if (!pkg) {
    warnings.push(
      `${projectRoot} 下没有 package.json${
        projectRootSource === "cwd-fallback"
          ? "；当前 projectRoot 来自 cwd 兜底，多半指错了 —— 传 projectRoot 或让客户端声明 MCP Roots"
          : ""
      }`,
    );
  }
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };

  const packageManager =
    Object.entries(LOCKFILES).find(([file]) => existsSync(join(projectRoot, file)))?.[1] ??
    (pkg?.packageManager ? String(pkg.packageManager).split("@")[0] : null);

  const framework = detectFramework(deps);

  const packages = {};
  for (const name of HULIAN_PACKAGES) {
    const installed = installedVersion(projectRoot, name, deps[name]);
    if (!installed && !deps[name]) continue;
    packages[name] = {
      declared: deps[name] ?? null,
      installed: installed?.version ?? null,
      linked: installed?.linked ?? false,
      linkKind: installed?.linkKind ?? null,
    };
  }

  // 这个根上没有瑚琏时，才去看它是不是 monorepo 根（有界探测，不递归）
  const candidates = packages["@hulianui/ui"] ? [] : workspaceCandidates(projectRoot);
  const suggested = candidates.find((entry) => entry.hulianUi) ?? null;

  const configs = {};
  for (const [key, candidates] of Object.entries(CONFIG_CANDIDATES)) {
    const hit = firstExisting(projectRoot, candidates);
    if (hit) configs[key] = hit.rel;
  }

  const nextConfigText = configs.next ? readTextIfExists(join(projectRoot, configs.next)) : null;
  const viteConfigText = configs.vite ? readTextIfExists(join(projectRoot, configs.vite)) : null;
  const vitestConfigText = configs.vitest
    ? readTextIfExists(join(projectRoot, configs.vitest))
    : viteConfigText;

  const componentsJson = configs.components
    ? readJson(join(projectRoot, configs.components))
    : null;

  const themeProvider = probe(projectRoot, ENTRY_CANDIDATES, /<ThemeProvider[\s/>]/);
  const configProvider = probe(projectRoot, ENTRY_CANDIDATES, /<ConfigProvider[\s/>]/);
  const accessProvider = probe(projectRoot, ENTRY_CANDIDATES, /<AccessProvider[\s/>]/);
  // 入口 import 推出来的样式表排在固定候选之前 —— 那是这个项目真正在用的那份
  const cssCandidates = [...new Set([...cssFromEntries(projectRoot), ...CSS_CANDIDATES])];
  const tokensCss = probe(projectRoot, cssCandidates, /@hulianui\/tokens\/tokens\.css/);
  const tailwindSourceProbe = probe(projectRoot, cssCandidates, /@source[^\n]*@hulianui\/ui/);
  // 写了 @source ≠ 指对了：把路径解析出来看目标存不存在（hulianui/hulian#66）。
  const sourceTargets = tailwindSourceProbe.file
    ? resolveSourceTargets(
        join(projectRoot, tailwindSourceProbe.file),
        readTextIfExists(join(projectRoot, tailwindSourceProbe.file)) ?? "",
      )
    : [];
  const tailwindSource = {
    ...tailwindSourceProbe,
    status:
      tailwindSourceProbe.status === "detected" && sourceTargets.length > 0
        ? sourceTargets.some((t) => t.exists)
          ? "detected"
          : "invalid"
        : tailwindSourceProbe.status,
    targets: sourceTargets,
  };

  const setup = {
    themeProvider: themeProvider.status,
    configProvider: configProvider.status,
    accessProvider: accessProvider.status,
    tokensCss: tokensCss.status,
    tailwindSource: tailwindSource.status,
    // 解析后的候选路径：便于消费方定位 pnpm workspace 与单包安装的差异
    tailwindSourceTargets: tailwindSource.targets,
    componentsJson: configs.components ?? null,
    transpilePackages: nextConfigText
      ? /transpilePackages[\s\S]{0,120}@hulianui\/ui/.test(nextConfigText)
        ? "detected"
        : "not-found"
      : "unknown",
    optimizePackageImports: nextConfigText
      ? /optimizePackageImports[\s\S]{0,120}@hulianui\/ui/.test(nextConfigText)
        ? "detected"
        : "not-found"
      : "unknown",
    vitePlugin: viteConfigText
      ? /@hulianui\/ui\/vite/.test(viteConfigText)
        ? "detected"
        : "not-found"
      : "unknown",
    vitestPreset: vitestConfigText
      ? /@hulianui\/ui\/vitest-preset|withHulian/.test(vitestConfigText)
        ? "detected"
        : "not-found"
      : "unknown",
    scannedEntryFiles: themeProvider.scanned,
    scannedCssFiles: tokensCss.scanned,
  };

  // --------------------------------------------------------------- warnings --

  if (projectRootSource === "cwd-fallback") {
    warnings.push(
      "projectRoot 来自 cwd 兜底（客户端未声明 MCP Roots、也没传 projectRoot）；结论可能属于另一个仓库",
    );
  }
  if (!packages["@hulianui/ui"]) {
    warnings.push(
      suggested
        ? `这个目录没有 @hulianui/ui，但它像是 monorepo 根：子项目 ${suggested.path}/ 里装着 ` +
          `@hulianui/ui ${suggested.hulianUi}（${suggested.framework}）。` +
          `带 projectRoot="${join(projectRoot, suggested.path)}" 重新调用才能得到准确结论 —— ` +
          `本次结果只描述当前目录，未替你切换。`
        : candidates.length
          ? `没有检测到 @hulianui/ui。这个目录下有 ${candidates.length} 个子项目` +
            `（${candidates.map((entry) => entry.path).join(", ")}），都没装瑚琏；` +
            `如果前端在别处，请显式传 projectRoot`
          : "没有检测到 @hulianui/ui —— 先 `pnpm add @hulianui/ui @hulianui/tokens`",
    );
  }
  if (packages["@hulianui/ui"] && !packages["@hulianui/tokens"]) {
    warnings.push("装了 @hulianui/ui 但没有 @hulianui/tokens：组件会渲染出来但完全没有颜色");
  }
  if (packages["@hulianui/ui"] && !deps["@base-ui/react"]) {
    warnings.push("@base-ui/react 是 peerDependency，消费方 package.json 里必须自己声明");
  }
  // 下面这些只在「这个项目确实用瑚琏」时才有意义 —— 对着一个 monorepo 根抱怨缺 ThemeProvider
  // 只是噪音，还会盖住真正要说的那句「前端在 web/」。
  const usesHulian = Boolean(packages["@hulianui/ui"]);
  if (usesHulian && tokensCss.status === "not-found") {
    warnings.push(
      `扫过的样式表（${tokensCss.scanned.join(", ") || "无"}）里没有 @hulianui/tokens/tokens.css；` +
        "若样式表不在这些位置请自行确认，漏了这行组件全无样式",
    );
  }
  // `unknown` 是「没找到文件」，不是「你没接」—— 这两件事必须说清楚，否则模型会读成后者，
  // 对一个接入完全正确的项目开出一堆修复建议（#46）。
  if (usesHulian && tokensCss.status === "unknown") {
    warnings.push(
      "没找到任何全局样式表：常见路径都不存在，扫过的入口文件里也没有相对路径的 CSS import。" +
        "tokens.css / @source 两项因此是 unknown（**探测不到**，不是「你没接」）—— " +
        "样式表若在别处，带上它的路径自行确认，别据此断定缺接入",
    );
  }
  if (usesHulian && tailwindSource.status === "invalid") {
    warnings.push(
      `${tailwindSourceProbe.file} 里写了 @source 指向 @hulianui/ui，但解析后的目标不存在：` +
        `${tailwindSource.targets.map((t) => `${t.raw} → ${t.resolved}`).join("；")}。` +
        "这条最阴：构建照样成功、DOM className 也正常，但库内 Tailwind 工具类一个都没生成，" +
        "页面退化成无样式文本。pnpm workspace 里包常被提到 <app>/node_modules，" +
        "路径层级要按样式表**自身所在目录**数",
    );
  }
  if (usesHulian && tailwindSource.status === "not-found") {
    warnings.push(
      "扫过的样式表里没有 @source 指向 @hulianui/ui/src —— Tailwind v4 默认不扫 node_modules，" +
        "漏了会把组件类名 purge 掉",
    );
  }
  if (usesHulian && themeProvider.status === "not-found") {
    warnings.push(
      `扫过的入口文件（${themeProvider.scanned.join(", ") || "无"}）里没有 ThemeProvider；` +
        "组件树必须被它包裹，暗色与运行时换肤都靠它",
    );
  }
  // ThemeProvider 漏了页面立刻不对，ConfigProvider 漏了页面**看起来完全正常** ——
  // 回退掉的是组件内置文案，其中大半在 aria-label 里（NumberField 的「减少」「增加」、
  // Spinner 的「加载中」、Tag 的「移除」）。英文产品能带着一屏中文读屏标签上线而无人察觉
  //（hulianui/hulian#164）。所以这条按「建议」报，但必须报。
  if (usesHulian && configProvider.status === "not-found") {
    warnings.push(
      `建议：扫过的入口文件（${configProvider.scanned.join(", ") || "无"}）里没有 ConfigProvider。` +
        "缺它时组件内置文案（含 aria-label）静默回退成 zh-CN —— 中文应用可以不挂，" +
        "其它语言它是必需品：<ConfigProvider locale={enUS}>，或 spread enUS 覆盖成自己的语言。" +
        "这条不是 error，它探测的是入口文件里有没有这个标签，i18n 桥层挂在别处就自行确认",
    );
  }
  if (usesHulian && framework.name === "next" && setup.transpilePackages === "not-found") {
    warnings.push("Next 消费方缺 transpilePackages: ['@hulianui/ui'] —— 源码分发必须转译，否则起不来");
  }
  if (packages["@hulianui/ui"]?.linked && setup.vitePlugin === "not-found") {
    warnings.push(
      "@hulianui/ui 是本地源码接入的（link: / file: / workspace:），但 vite 配置里没有 @hulianui/ui/vite 插件：" +
        "Vite 会跳过 linked 包预构建，dev 模块请求实测差 15 倍",
    );
  }
  for (const [name, info] of Object.entries(packages)) {
    if (!info.declared || !info.installed || info.linked) continue;
    const drift = versionDrift(info.declared, info.installed);
    if (drift) warnings.push(`${name} 声明 ${info.declared} 但实装 ${info.installed}：${drift}`);
  }

  return {
    projectRoot,
    projectRootSource,
    packageManager,
    framework,
    packages,
    workspaceCandidates: candidates,
    suggestedProjectRoot: suggested ? join(projectRoot, suggested.path) : null,
    configs,
    componentsJson: componentsJson
      ? {
          file: configs.components,
          aliases: componentsJson.aliases ?? null,
          registries: componentsJson.registries ?? null,
        }
      : null,
    setup,
    importStrategy: recommendImports({ framework, packages, setup }),
    warnings,
  };
}

/**
 * 导入策略必须结合**当前项目**给，而不是背一条全局结论。
 * 根 barrel / 子路径 / optimizePackageImports 各有适用面，见 consuming.md §3。
 */
function recommendImports({ framework, packages, setup }) {
  const ui = packages["@hulianui/ui"];
  if (!ui) return { recommended: "unknown", reason: "尚未安装 @hulianui/ui" };
  if (framework.name === "next") {
    return {
      recommended: "root-barrel",
      reason:
        setup.optimizePackageImports === "detected"
          ? "Next 已开 optimizePackageImports，编译期会把根 barrel 改写成深路径，业务代码不必动"
          : "Next 建议留在根 barrel，并补 experimental.optimizePackageImports（webpack dev 冷编译实测 16.5s → 3.9s）；Turbopack 下加了也无害",
    };
  }
  if (framework.name === "vite") {
    return {
      recommended: ui.linked ? "root-barrel-with-vite-plugin" : "root-barrel",
      reason: ui.linked
        ? "本地源码接入必须让 Vite 预构建瑚琏：加 @hulianui/ui/vite 的 hulian() 插件，或手写 optimizeDeps.include"
        : "npm 安装的包 Vite 会自动预打包，不需要额外配置；只用十几个组件时子路径入口能进一步瘦模块图",
    };
  }
  return {
    recommended: "root-barrel",
    reason: "默认根 barrel；只用少数几个组件、或打包器不做预构建时改子路径 @hulianui/ui/<slug>",
  };
}

/** 探测结果渲染成给人/模型读的文本（structuredContent 里仍是上面的对象）。 */
export function renderProject(info) {
  const lines = [
    `# 消费项目探测`,
    "",
    `- projectRoot：${info.projectRoot}（来源 ${info.projectRootSource}）`,
    `- 框架：${info.framework.name}${info.framework.version ? ` ${info.framework.version}` : ""}` +
      (info.packageManager ? ` · 包管理器 ${info.packageManager}` : ""),
  ];
  const pkgLines = Object.entries(info.packages).map(
    ([name, value]) =>
      `  - ${name}：实装 ${value.installed ?? "未安装"}${
        value.declared ? `（声明 ${value.declared}）` : ""
      }${value.linkKind === "workspace" ? " · workspace 包" : value.linkKind ? " · 本地源码接入" : ""}`,
  );
  lines.push(`- 瑚琏包：${pkgLines.length ? "" : "无"}`, ...pkgLines);
  if (info.workspaceCandidates.length) {
    lines.push(
      `- 这个目录下的子项目（**未替你切换**，需要哪个就带 projectRoot 再调一次）：`,
      ...info.workspaceCandidates.map(
        (entry) =>
          `  - ${entry.path}/ · ${entry.framework}${entry.hulianUi ? ` · @hulianui/ui ${entry.hulianUi}` : " · 未装瑚琏"}`,
      ),
    );
    if (info.suggestedProjectRoot) lines.push(`  → 建议：projectRoot="${info.suggestedProjectRoot}"`);
  }
  lines.push(
    `- 接入状态：ThemeProvider ${info.setup.themeProvider} · ConfigProvider ${info.setup.configProvider} · ` +
      `tokens.css ${info.setup.tokensCss} · ` +
      `@source ${info.setup.tailwindSource} · transpilePackages ${info.setup.transpilePackages} · ` +
      `optimizePackageImports ${info.setup.optimizePackageImports} · vite 插件 ${info.setup.vitePlugin} · ` +
      `vitest preset ${info.setup.vitestPreset}`,
  );
  if (info.componentsJson) {
    lines.push(`- components.json：${info.componentsJson.file}（shadcn 兼容，可直接 npx shadcn add）`);
  }
  lines.push(`- 导入策略：${info.importStrategy.recommended} —— ${info.importStrategy.reason}`);
  if (info.warnings.length) {
    lines.push("", "## 需要注意", ...info.warnings.map((warning) => `- ⚠️ ${warning}`));
  }
  lines.push(
    "",
    "> `not-found` = 在扫描过的已知位置里没看到，**不等于不存在**（本工具不递归遍历仓库）；" +
      "`unknown` = 相关配置文件本身不存在。缺哪一项就调 get_setup_guide 取对应的接入片段。",
  );
  return lines.join("\n");
}
