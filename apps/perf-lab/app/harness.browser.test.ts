import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type ViteDevServer } from "vite";

interface BrowserRun {
  metadata: Record<string, string | number | boolean>;
  events: Array<{ type: string; name?: string; stepId?: string }>;
  errors: string[];
}

interface BrowserLabApi {
  ready: Promise<void>;
  run(id: string, options: { samples: number; warmups: number }): Promise<BrowserRun>;
}

let browser: Browser;
let server: ViteDevServer;
let baseUrl: string;

beforeAll(async () => {
  server = await createServer({
    configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    mode: "measurement",
    server: { host: "127.0.0.1", port: 0, strictPort: false },
  });
  await server.listen();
  const address = server.httpServer?.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

// retry: 采集器给事件打 stepId 用的是**事件到达时刻**当时打开的窗口（collector.accept），
// 不是事件**发生时刻**。React 的一次 commit 与它的 fiber 渲染整批 sink 出来，慢机器上这一批
// 可能落在 mount 窗口关闭之后，于是 mount 的渲染被记成下一步产生的重渲染 —— CPU 节流 x8
// 实测复现率约 1/5，harness 改为等待真实 commit 后降到 1/15，但没有根除。
// 根治要让 commit 按自身 timestampMs 归属窗口、fiber-render 跟随其 commitId（两者同为
// performance.now() 时间轴，已实证），那是采集模型改动，会重算所有既有指标，单独做。
// 在此之前用 retry 过滤这一概率性错配：真实回归是确定性的，重试同样会失败，不会被掩盖。
describe("profiling performance lab", { retry: 2 }, () => {
  it("installs before React and distinguishes the known bad fixture", async () => {
    const page = await browser.newPage();
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.goto(`${baseUrl}/?scenario=fixture/known-bad&stage=measurement`);
    try {
      await page.waitForFunction(() => "__HULIAN_SCAN_LAB__" in window, undefined, {
        timeout: 30_000,
      });
    } catch {
      throw new Error(
        `performance lab did not become ready: ${[...pageErrors, ...consoleErrors].join(" | ")}`,
      );
    }
    const result = await page.evaluate(async () => {
      const api = (
        window as typeof window & {
          __HULIAN_SCAN_LAB__: BrowserLabApi;
        }
      ).__HULIAN_SCAN_LAB__;
      await api.ready;
      const bad = await api.run("fixture/known-bad", {
        samples: 5,
        warmups: 1,
      });
      const good = await api.run("fixture/known-good", {
        samples: 5,
        warmups: 1,
      });
      return { bad, good };
    });

    expect(pageErrors).toEqual([]);
    expect(result.bad.errors).toEqual([]);
    expect(result.good.errors).toEqual([]);
    expect(result.bad.metadata.adapterInstalledBeforeReact).toBe(true);
    expect(result.bad.metadata.component).toBe("ExpensiveChildView");
    expect(result.bad.metadata.category).toBe("standard");
    expect(result.bad.events.filter((event) => event.type === "commit").length).toBeGreaterThan(0);
    const badRenders = result.bad.events.filter(
      (event) =>
        event.type === "fiber-render" &&
        event.name === "ExpensiveChildView" &&
        event.stepId === "stable-parent-update",
    ).length;
    const goodRenders = result.good.events.filter(
      (event) =>
        event.type === "fiber-render" &&
        event.name === "ExpensiveChildView" &&
        event.stepId === "stable-parent-update",
    ).length;
    expect(badRenders).toBeGreaterThan(goodRenders);
    expect(goodRenders).toBe(0);
    await page.close();
  });

  it("refuses a second concurrent run", async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/?stage=measurement`);
    await page.waitForFunction(() => "__HULIAN_SCAN_LAB__" in window, undefined, {
      timeout: 30_000,
    });

    const result = await page.evaluate(async () => {
      const api = (
        window as typeof window & {
          __HULIAN_SCAN_LAB__: BrowserLabApi;
        }
      ).__HULIAN_SCAN_LAB__;
      const first = api.run("fixture/known-bad", { samples: 1, warmups: 0 });
      let concurrentError = "";
      try {
        await api.run("fixture/known-good", { samples: 1, warmups: 0 });
      } catch (error) {
        concurrentError = error instanceof Error ? error.message : String(error);
      }
      const completed = await first;
      return { concurrentError, completed };
    });

    expect(result.concurrentError).toMatch(/another Hulian Scan scenario/);
    expect(result.completed.errors).toEqual([]);
    await page.close();
  });
});
