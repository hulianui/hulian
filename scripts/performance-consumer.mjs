#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

const forbiddenBundlePatterns = [
  /(?:^|[/\\])@hulianui[/\\]hulian-scan(?:[/\\]|$)/i,
  /(?:^|[/\\])react-scan(?:[/\\]|$)/i,
  /(?:^|[/\\])bippy(?:[/\\]|$)/i,
  /(?:^|[/\\])why-did-you-render(?:[/\\]|$)/i,
];

function forbiddenInputs(inputs, repositoryRoot = "") {
  return inputs.filter(
    (input) =>
      forbiddenBundlePatterns.some((pattern) => pattern.test(input)) ||
      (repositoryRoot !== "" && input.includes(repositoryRoot)),
  );
}

async function checkMetafile(path) {
  if (!path) throw new Error("--check-metafile requires a path");
  const metafile = JSON.parse(await readFile(path, "utf8"));
  const inputs = Object.keys(metafile.inputs ?? {});
  const forbidden = forbiddenInputs(inputs, process.env.HULIAN_PERFORMANCE_REPO_ROOT);
  if (forbidden.length > 0) {
    for (const input of forbidden) console.error(input);
    process.exitCode = 1;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(`${command} exited with status ${result.status}`);
  }
  return result.stdout ?? "";
}

async function cleanValidatedChildren(consumerRoot) {
  for (const child of ["app", "artifacts"]) {
    const target = join(consumerRoot, child);
    if (dirname(target) !== consumerRoot)
      throw new Error(`unsafe consumer cleanup target: ${target}`);
    await rm(target, { recursive: true, force: true });
  }
  await Promise.all(
    ["app", "store", "artifacts"].map((child) =>
      mkdir(join(consumerRoot, child), { recursive: true }),
    ),
  );
}

async function packWorkspacePackage(repositoryRoot, packageDirectory, artifacts) {
  const before = new Set(await readdir(artifacts));
  run("pnpm", ["pack", "--pack-destination", artifacts], {
    cwd: join(repositoryRoot, packageDirectory),
    capture: true,
  });
  const created = (await readdir(artifacts)).filter(
    (file) => file.endsWith(".tgz") && !before.has(file),
  );
  if (created.length !== 1) {
    throw new Error(`expected one tarball for ${packageDirectory}, received ${created.join(", ")}`);
  }
  return join(artifacts, created[0]);
}

function packageFileReference(appRoot, tarball) {
  return `file:${relative(appRoot, tarball).split(sep).join("/")}`;
}

function transformShowcaseImports(source, slug) {
  const publicSpecifier = (specifier) => {
    if (specifier === "../showcase/types") return "@hulianui/ui";
    if (specifier === `./${slug}` || specifier === "./index") return `@hulianui/ui/${slug}`;
    if (specifier.startsWith("../")) {
      const segments = specifier.slice(3).split("/");
      const [target, nested] = segments;
      if (target === "showcase") return "@hulianui/ui";
      if (target.startsWith("_")) return specifier;
      if (segments.length === 1 || nested === target || nested === "index") {
        return `@hulianui/ui/${target}`;
      }
    }
    return specifier;
  };
  return source.replace(
    /((?:from\s+|import\s*\(\s*|import\s+)["'])(\.\.?\/[^"']+)(["'])/g,
    (_match, prefix, specifier, quote) => `${prefix}${publicSpecifier(specifier)}${quote}`,
  );
}

async function existingSource(basePath) {
  for (const extension of [".tsx", ".ts", ".jsx", ".js"]) {
    try {
      await stat(`${basePath}${extension}`);
      return `${basePath}${extension}`;
    } catch {
      // Try the next packaged source extension.
    }
  }
  throw new Error(`packaged showcase source is missing: ${basePath}`);
}

async function transformScenarioLoaders(appRoot) {
  const generatedPath = join(appRoot, "scenarios/generated.ts");
  let generated = await readFile(generatedPath, "utf8");
  const paths = [...generated.matchAll(/import\(\s*"@hulianui\/ui-internal\/([^"?]+)"\s*\)/g)].map(
    (match) => match[1],
  );
  if (paths.length === 0) throw new Error("packed scenario generator found no UI loaders");
  const uniquePaths = [...new Set(paths)];
  const packedSourceRoot = join(appRoot, "scenarios/packed");
  await rm(packedSourceRoot, { recursive: true, force: true });
  await cp(join(appRoot, "node_modules/@hulianui/ui/src"), packedSourceRoot, {
    recursive: true,
  });
  for (const sourcePath of uniquePaths) {
    const slug = sourcePath.split("/")[0];
    const destinationBase = join(packedSourceRoot, sourcePath);
    const destination = await existingSource(destinationBase);
    const transformed = transformShowcaseImports(await readFile(destination, "utf8"), slug);
    await writeFile(destination, transformed, "utf8");
  }
  generated = generated.replace(
    /import\(\s*"@hulianui\/ui-internal\/([^"?]+)"\s*\)/g,
    'import("./packed/$1")',
  );
  if (generated.includes("ui-internal"))
    throw new Error("packed generated loaders retain ui-internal");
  await writeFile(generatedPath, generated, "utf8");
  return uniquePaths.map((sourcePath) => sourcePath.split("/")[0]);
}

async function writeExternalLab({ appRoot, repositoryRoot, consumerRoot, tarballs, reactVersion }) {
  const uiManifest = JSON.parse(
    await readFile(join(repositoryRoot, "packages/ui/package.json"), "utf8"),
  );
  await Promise.all([
    cp(join(repositoryRoot, "apps/perf-lab/app"), join(appRoot, "app"), { recursive: true }),
    cp(join(repositoryRoot, "apps/perf-lab/fixtures"), join(appRoot, "fixtures"), {
      recursive: true,
    }),
    cp(join(repositoryRoot, "apps/perf-lab/scenarios"), join(appRoot, "scenarios"), {
      recursive: true,
    }),
    cp(join(repositoryRoot, "apps/perf-lab/index.html"), join(appRoot, "index.html")),
  ]);
  const stylesPath = join(appRoot, "app/styles.css");
  const styles = (await readFile(stylesPath, "utf8")).replace(
    '@source "../../../packages/ui/src/**/*.{ts,tsx}";',
    '@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";',
  );
  await writeFile(stylesPath, styles, "utf8");
  await writeFile(join(appRoot, ".npmrc"), "node-linker=isolated\n", "utf8");
  await writeFile(
    join(appRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "hulian-scan-packed-consumer",
        private: true,
        type: "module",
        scripts: {
          "build:measurement": "vite build --mode measurement",
          "build:diagnosis": "vite build --mode diagnosis",
          typecheck: "tsc --noEmit",
        },
        dependencies: {
          ...uiManifest.dependencies,
          "@hulianui/hulian-scan": packageFileReference(appRoot, tarballs.scanner),
          "@hulianui/tokens": packageFileReference(appRoot, tarballs.tokens),
          "@hulianui/ui": packageFileReference(appRoot, tarballs.ui),
          "@base-ui/react": "1.6.0",
          "@tailwindcss/vite": "4.3.3",
          "@types/node": "24.13.3",
          "@types/react": reactVersion.startsWith("18") ? "18.3.28" : "19.2.18",
          "@types/react-dom": reactVersion.startsWith("18") ? "18.3.7" : "19.2.4",
          "@vitejs/plugin-react": "4.7.0",
          "lucide-react": "1.28.0",
          motion: "12.43.0",
          react: reactVersion,
          "react-dom": reactVersion,
          tailwindcss: "4.3.3",
          typescript: "7.0.2",
          vite: "7.3.6",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    join(appRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          useDefineForClassFields: true,
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: "ESNext",
          moduleResolution: "Bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          types: ["node", "vite/client"],
        },
        include: ["app", "fixtures", "scenarios", "vite.config.ts", "consumer-entry.tsx"],
        exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.browser.test.ts"],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    join(appRoot, "vite.config.ts"),
    `import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);
const reactDomProfiling = require.resolve("react-dom/profiling");

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [{ find: /^react-dom\\/client$/, replacement: reactDomProfiling }],
  },
  build: { minify: false, sourcemap: true },
  define: {
    __HULIAN_SCAN_STAGE__: JSON.stringify(mode === "measurement" ? "measurement" : "diagnosis"),
  },
}));
`,
    "utf8",
  );
  await writeFile(
    join(appRoot, "vite.consumer.config.ts"),
    `import react from "@vitejs/plugin-react";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "hulian-consumer-metafile",
      generateBundle() {
        const inputs = Object.fromEntries([...this.getModuleIds()].map((id) => [id, {}]));
        writeFileSync(process.env.HULIAN_CONSUMER_METAFILE!, JSON.stringify({ inputs }, null, 2));
      },
    },
  ],
  resolve: { dedupe: ["react", "react-dom"] },
  build: {
    outDir: "dist-consumer",
    sourcemap: true,
    lib: { entry: resolve("consumer-entry.tsx"), formats: ["es"] },
  },
});
`,
    "utf8",
  );
  run(
    "pnpm",
    ["install", "--store-dir", join(consumerRoot, "store"), "--config.node-linker=isolated"],
    { cwd: appRoot },
  );
}

function selectedSlugs(args, allSlugs) {
  if (args.includes("--smoke")) {
    return ["animated-beam", "button", "dialog", "table"].filter((slug) =>
      allSlugs.includes(slug),
    );
  }
  if (args.includes("--full") || !args.includes("--scenario")) return [...new Set(allSlugs)].sort();
  const selected = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--scenario") continue;
    const ids = String(args[index + 1] ?? "").split(",");
    for (const id of ids) selected.push(id.split("/")[0]);
    index += 1;
  }
  return [...new Set(selected.filter((slug) => allSlugs.includes(slug)))].sort();
}

async function writeAndBuildBusinessBundle(appRoot, consumerRoot, slugs) {
  if (slugs.length === 0) throw new Error("packed consumer selected no public UI entries");
  await writeFile(
    join(appRoot, "consumer-entry.tsx"),
    `${slugs.map((slug) => `import "@hulianui/ui/${slug}";`).join("\n")}\n`,
    "utf8",
  );
  const metafile = join(consumerRoot, "artifacts/consumer-meta.json");
  run("pnpm", ["exec", "vite", "build", "--config", "vite.consumer.config.ts"], {
    cwd: appRoot,
    env: { ...process.env, HULIAN_CONSUMER_METAFILE: metafile },
  });
  const parsed = JSON.parse(await readFile(metafile, "utf8"));
  const forbidden = forbiddenInputs(
    Object.keys(parsed.inputs ?? {}),
    process.env.HULIAN_PERFORMANCE_REPO_ROOT,
  );
  if (forbidden.length > 0)
    throw new Error(`business bundle contains forbidden modules:\n${forbidden.join("\n")}`);
  return metafile;
}

async function listFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else files.push(path);
  }
  return files;
}

async function assertNoWorkspaceLeaks(appRoot, repositoryRoot) {
  const candidates = [join(appRoot, "pnpm-lock.yaml")];
  for (const directory of [join(appRoot, "dist"), join(appRoot, "dist-consumer")]) {
    try {
      candidates.push(...(await listFiles(directory)).filter((path) => path.endsWith(".map")));
    } catch {
      // A build stage may not have produced this directory yet.
    }
  }
  for (const path of candidates) {
    const contents = await readFile(path, "utf8");
    if (contents.includes("workspace:") || contents.includes(repositoryRoot)) {
      throw new Error(`packed consumer leaked workspace provenance: ${path}`);
    }
  }
  const uiPath = await realpath(join(appRoot, "node_modules/@hulianui/ui"));
  if (uiPath === repositoryRoot || uiPath.startsWith(`${repositoryRoot}${sep}`)) {
    throw new Error(`packed UI resolves into repository: ${uiPath}`);
  }
}

function withoutEnvironmentArgs(args) {
  const forwarded = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--environment") {
      index += 1;
      continue;
    }
    forwarded.push(args[index]);
  }
  return forwarded;
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function assertCiBaseline(args, repositoryRoot) {
  const react = valueAfter(args, "--react") ?? process.env.PERFORMANCE_REACT_VERSION ?? "19";
  if (!args.includes("--ci") || react === "18") return;
  const baseline = resolve(
    repositoryRoot,
    valueAfter(args, "--from-baseline") ?? "scripts/performance-baseline.json",
  );
  let parsed;
  try {
    parsed = JSON.parse(await readFile(baseline, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`performance baseline is missing or invalid: ${detail}`);
  }
  if (
    parsed?.schemaVersion !== 1 ||
    parsed?.react !== "19.2.8" ||
    parsed?.environment !== "packed-consumer" ||
    typeof parsed?.scenarios !== "object" ||
    parsed.scenarios === null ||
    Object.keys(parsed.scenarios).length === 0
  ) {
    throw new Error("performance baseline is empty or invalid; run pnpm scan:update explicitly");
  }
}

async function runPackedConsumer(args) {
  const repositoryRoot = process.env.HULIAN_PERFORMANCE_REPO_ROOT;
  const consumerRoot = process.env.HULIAN_PERFORMANCE_CONSUMER_ROOT;
  if (!repositoryRoot || !consumerRoot) {
    throw new Error("performance-consumer.sh must provide validated repository and consumer roots");
  }
  await assertCiBaseline(args, repositoryRoot);
  const appRoot = join(consumerRoot, "app");
  const artifacts = join(consumerRoot, "artifacts");
  await cleanValidatedChildren(consumerRoot);
  const tokens = await packWorkspacePackage(repositoryRoot, "packages/tokens", artifacts);
  const ui = await packWorkspacePackage(repositoryRoot, "packages/ui", artifacts);
  const scanner = await packWorkspacePackage(repositoryRoot, "packages/hulian-scan", artifacts);
  const reactFlag = args.indexOf("--react");
  const reactVersion =
    (reactFlag >= 0 ? args[reactFlag + 1] : process.env.PERFORMANCE_REACT_VERSION) === "18"
      ? "18.3.1"
      : "19.2.8";
  await writeExternalLab({
    appRoot,
    repositoryRoot,
    consumerRoot,
    tarballs: { tokens, ui, scanner },
    reactVersion,
  });
  const allSlugs = await transformScenarioLoaders(appRoot);
  run("pnpm", ["exec", "tsc", "--noEmit"], { cwd: appRoot });
  await writeAndBuildBusinessBundle(appRoot, consumerRoot, selectedSlugs(args, allSlugs));
  await assertNoWorkspaceLeaks(appRoot, repositoryRoot);
  if (args.includes("--prepare-only")) return;
  const updateBaseline = args.includes("--update") && !args.includes("--from");
  const forwarded = withoutEnvironmentArgs(args).filter((argument) => argument !== "--update");
  let output = valueAfter(forwarded, "--output");
  if (updateBaseline && !output) {
    output = ".hulian-scan/baseline-candidate";
    forwarded.push("--output", output);
  }
  run(
    "node",
    [
      join(repositoryRoot, "scripts/hulian-scan.mjs"),
      ...forwarded,
      "--environment",
      "packed-consumer",
    ],
    {
      cwd: repositoryRoot,
      env: { ...process.env, HULIAN_SCAN_LAB_DIR: appRoot },
    },
  );
  await assertNoWorkspaceLeaks(appRoot, repositoryRoot);
  if (updateBaseline) {
    run(
      "node",
      [
        join(repositoryRoot, "scripts/hulian-scan.mjs"),
        "--update",
        "--from",
        join(resolve(repositoryRoot, output), "summary.json"),
      ],
      {
        cwd: repositoryRoot,
        env: { ...process.env, HULIAN_SCAN_LAB_DIR: appRoot },
      },
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--check-metafile") {
    await checkMetafile(args[1]);
    return;
  }
  await runPackedConsumer(args);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
