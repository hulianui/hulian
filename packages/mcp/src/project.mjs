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

import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

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

/** 全局样式表的候选位置（token CSS 与 @source 扫描都写在这儿）。 */
const CSS_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "src/index.css",
  "src/main.css",
  "src/App.css",
  "src/styles/index.css",
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
export function installedVersion(root, name) {
  let dir = root;
  for (let depth = 0; depth < 4; depth += 1) {
    const manifest = readJson(join(dir, "node_modules", name, "package.json"));
    if (manifest?.version) {
      const linked = isSymlink(join(dir, "node_modules", name));
      return { version: manifest.version, linked, from: join(dir, "node_modules", name) };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
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
    const installed = installedVersion(dir, "@hulianui/ui");
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
    const installed = installedVersion(projectRoot, name);
    if (!installed && !deps[name]) continue;
    packages[name] = {
      declared: deps[name] ?? null,
      installed: installed?.version ?? null,
      linked: installed?.linked ?? false,
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
  const tokensCss = probe(projectRoot, CSS_CANDIDATES, /@hulianui\/tokens\/tokens\.css/);
  const tailwindSource = probe(projectRoot, CSS_CANDIDATES, /@source[^\n]*@hulianui\/ui/);

  const setup = {
    themeProvider: themeProvider.status,
    configProvider: configProvider.status,
    accessProvider: accessProvider.status,
    tokensCss: tokensCss.status,
    tailwindSource: tailwindSource.status,
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
  if (usesHulian && framework.name === "next" && setup.transpilePackages === "not-found") {
    warnings.push("Next 消费方缺 transpilePackages: ['@hulianui/ui'] —— 源码分发必须转译，否则起不来");
  }
  if (packages["@hulianui/ui"]?.linked && setup.vitePlugin === "not-found") {
    warnings.push(
      "@hulianui/ui 是软链进来的，但 vite 配置里没有 @hulianui/ui/vite 插件：" +
        "Vite 会跳过 linked 包预构建，dev 模块请求实测差 15 倍",
    );
  }
  for (const [name, info] of Object.entries(packages)) {
    if (info.declared && info.installed && !info.linked) {
      const declared = info.declared.replace(/^[\^~>=<\s]*/, "");
      if (declared && !info.installed.startsWith(declared.split(".")[0])) {
        warnings.push(`${name} 声明 ${info.declared} 但实装 ${info.installed}，主版本不一致`);
      }
    }
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
        ? "软链消费必须让 Vite 预构建瑚琏：加 @hulianui/ui/vite 的 hulian() 插件，或手写 optimizeDeps.include"
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
      }${value.linked ? " · 软链" : ""}`,
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
    `- 接入状态：ThemeProvider ${info.setup.themeProvider} · tokens.css ${info.setup.tokensCss} · ` +
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
