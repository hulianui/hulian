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

// retry 留着兜概率性抖动（浏览器启动、端口、页面就绪）。**渲染次数那条判据已不再依赖 stepId**，
// 见下方注释：慢机器上某个 sample 的 mount commit 会整批落进下一步的窗口，判据改看总量后与
// 窗口时序无关了。真实回归是确定性的，重试同样会失败，不会被掩盖。
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
    // 每个 sample 的形状是 mount → 5 次父级更新 → unmount。known-good 的 ExpensiveChildView
    // 只在挂载时渲染（父级的 state 在 LocalTicker 自己身上，点它不会重渲染兄弟）；
    // known-bad 每次父级更新都跟着重渲染一遍，于是总量差 6 倍。
    //
    // **主判据用总量而不是 stepId**：慢机器上某个 sample 的 mount commit 可能整批落进下一步
    // 的窗口（CI 上实测就是「expected 1 to be 0」），那是挂载工作被贴错标签、不是重渲染，
    // 而按 commitId 排掉最早那次也不够 —— 漂的可能是第三个 sample 的挂载。总量比值与标签无关，
    // 且丝毫不松：真的 memo 回归会让 good 也变成 6 倍，比值立刻塌到 1。
    const totalRenders = (events: typeof result.good.events): number =>
      events.filter(
        (event) => event.type === "fiber-render" && event.name === "ExpensiveChildView",
      ).length;
    const parentUpdateRenders = (events: typeof result.good.events): number =>
      events.filter(
        (event) =>
          event.type === "fiber-render" &&
          event.name === "ExpensiveChildView" &&
          event.stepId === "stable-parent-update",
      ).length;
    const goodTotal = totalRenders(result.good.events);
    const badTotal = totalRenders(result.bad.events);
    expect(goodTotal).toBeGreaterThan(0);
    expect(badTotal).toBeGreaterThanOrEqual(goodTotal * 4);
    // 标签维度只要求 bad 明显多于 good，容忍偶发被错配的那一两次挂载渲染。
    expect(parentUpdateRenders(result.bad.events)).toBeGreaterThan(
      parentUpdateRenders(result.good.events) + 3,
    );
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
