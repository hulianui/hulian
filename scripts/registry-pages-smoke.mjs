#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = join(ROOT, "apps", "www", "public");
const REGISTRY_INDEX = join(PUBLIC_DIR, "registry.json");
const FIXTURE_DIR = join(ROOT, "scripts", "fixtures", "registry-consumer");

export function loadRegistryPageNames() {
  const registry = JSON.parse(readFileSync(REGISTRY_INDEX, "utf8"));
  return registry.items
    .filter((item) => item.meta?.kind === "page")
    .map((item) => item.name)
    .sort();
}

function run(command, args, cwd, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      reject(
        new Error(
          `${command} ${args.join(" ")} 失败（exit ${code}）\n` +
            `cwd: ${cwd}\n--- stdout ---\n${stdout}\n--- stderr ---\n${stderr}`,
        ),
      );
    });
  });
}

async function startRegistryServer(serveDir) {
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const relativePath = normalize(pathname).replace(/^[/\\]+/, "");
    const file = join(serveDir, relativePath);
    if (relative(serveDir, file).startsWith("..") || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end("not found");
      return;
    }
    response.setHeader("content-type", file.endsWith(".json") ? "application/json" : "text/plain");
    response.end(readFileSync(file));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.close();
      server.closeAllConnections();
    },
  };
}

async function installPageWithShadcn(name, { baseUrl, packageTarball, tempRoot }) {
  const caseDir = join(tempRoot, name);
  cpSync(FIXTURE_DIR, caseDir, { recursive: true });
  const packageFile = join(caseDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packageFile, "utf8"));
  const localPackage = `file:${packageTarball}`;
  packageJson.dependencies["@hulianui/ui"] = localPackage;
  packageJson.pnpm = { overrides: { "@hulianui/ui": localPackage } };
  writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
  await run(
    "pnpm",
    ["dlx", "shadcn@latest", "add", `${baseUrl}/r/${name}.json`, "--yes", "--overwrite"],
    caseDir,
  );
  await run("pnpm", ["install", "--ignore-workspace"], caseDir);
  await run("pnpm", ["exec", "tsc", "--noEmit"], caseDir);
  return name;
}

export async function runPageSmoke(options = {}) {
  const names = loadRegistryPageNames();
  if (names.length !== 20) throw new Error(`页面 registry 数量应为 20，实际为 ${names.length}`);

  const installAll = async (installPage) => {
    const checked = [];
    let cursor = 0;
    const worker = async () => {
      while (cursor < names.length) {
        const name = names[cursor++];
        checked.push(await installPage(name));
      }
    };
    const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, names.length));
    await Promise.all(Array.from({ length: concurrency }, worker));
    return checked;
  };

  if (options.installPage) {
    return { checked: await installAll(options.installPage) };
  }

  const tempRoot = mkdtempSync(join(tmpdir(), "hulian-pages-smoke-"));
  // registry 产物写进临时目录，**不碰仓库**。
  //
  // 这里原本是「把 apps/www/public 覆盖成 localhost base → 从那儿托管 → finally 里再生成回去」。
  // 问题在于还原只挂在一段跑好几分钟的 async 流程的 finally 上：Ctrl-C / 崩溃 / 机器休眠
  // 都会跳过它，于是 registry.json 与 llms*.txt 带着 `http://127.0.0.1:<随机端口>` 留在工作区，
  // 再被下一个 commit 顺手带走（ddf601f 就是这么把 localhost base 提交进 master 的）。
  // 改成写临时目录后，根本没有「需要还原」这一步，也就没有漏还原的可能。
  const registryOut = join(tempRoot, "registry-public");
  const registryServer = await startRegistryServer(registryOut);
  const checked = [];
  try {
    await run("pnpm", ["pack", "--pack-destination", tempRoot], join(ROOT, "packages", "ui"));
    const tarballName = readdirSync(tempRoot).find((file) => file.endsWith(".tgz"));
    if (!tarballName) throw new Error("pnpm pack 未生成 @hulianui/ui tarball");
    const packageTarball = join(tempRoot, tarballName);
    await run("node", ["scripts/gen-llms-registry.mjs"], ROOT, {
      env: {
        HULIAN_REGISTRY_BASE: `${registryServer.baseUrl}/r`,
        HULIAN_REGISTRY_OUT: registryOut,
      },
    });
    checked.push(
      ...(await installAll(async (name) => {
        process.stdout.write(`[registry-smoke] ${name}\n`);
        return installPageWithShadcn(name, { baseUrl: registryServer.baseUrl, packageTarball, tempRoot });
      })),
    );
    return { checked, tempRoot };
  } finally {
    await registryServer.close();
    // 无需还原仓库产物 —— 本次跑的所有 registry 产物都在 tempRoot 里。
    if (!options.keepTemp) rmSync(tempRoot, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runPageSmoke()
    .then(({ checked }) => {
      console.log(`[registry-smoke] PASS ${checked.length}/20 pages`);
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exitCode = 1;
    });
}
