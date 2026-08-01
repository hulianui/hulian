import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

// 静态导出产物的最小托管 —— a11y 门禁与视口门禁共用。
// 两道门禁都必须跑在 `next build` 的**导出产物**上而不是 dev server：dev 有 HMR 注入、
// 错误浮层与未压缩的懒加载时序，量出来的 DOM 数与首屏挂载数都不代表线上。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_DIR = join(ROOT, "apps", "www", "out");

export function contentType(file) {
  return (
    {
      ".css": "text/css",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript",
      ".json": "application/json",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".woff2": "font/woff2",
    }[extname(file)] ?? "application/octet-stream"
  );
}

// 目录穿越防护：候选路径必须仍落在 OUT_DIR 之内（relative 不以 .. 开头）。
export function resolveStaticFile(pathname, outDir = OUT_DIR) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  const base = join(outDir, clean);
  const candidates = [base, `${base}.html`, join(base, "index.html")];
  for (const candidate of candidates) {
    if (
      !relative(outDir, candidate).startsWith("..") &&
      existsSync(candidate) &&
      statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }
  return null;
}

/**
 * 打开页面并等到「可以量了」。
 *
 * 刻意不用 `waitUntil: "networkidle"` —— 本站有常驻的客户端活动（mock/预取/字体），
 * /components 这类重页面上它会一直等到 30s 超时，报出来的却是「导航超时」，
 * 看着像页面坏了。改为 load + 等一个确定存在的正文锚点 + 两帧，
 * 让布局与 IntersectionObserver 都跑完再取快照。
 */
export async function gotoAndSettle(page, url, { anchor = "h1", settleMs = 400 } = {}) {
  const response = await page.goto(url, { waitUntil: "load" });
  if (!response?.ok()) {
    throw new Error(`route load failed: ${url} (status ${response?.status() ?? "none"})`);
  }
  await page.waitForSelector(anchor, { state: "attached", timeout: 15000 });
  await page.waitForTimeout(settleMs);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  return response;
}

export async function startStaticServer(outDir = OUT_DIR) {
  if (!existsSync(join(outDir, "index.html"))) {
    throw new Error("apps/www/out 不存在，请先运行 pnpm --filter www build");
  }
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const file = resolveStaticFile(pathname, outDir);
    if (!file) {
      response.writeHead(404).end("not found");
      return;
    }
    response.setHeader("content-type", contentType(file));
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
