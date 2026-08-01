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
  run(
    id: string,
    options: { samples: number; warmups: number },
  ): Promise<BrowserRun>;
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

describe("profiling performance lab", () => {
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
      await page.waitForFunction(
        () => "__HULIAN_SCAN_LAB__" in window,
        undefined,
        { timeout: 10_000 },
      );
    } catch {
      throw new Error(
        `performance lab did not become ready: ${[...pageErrors, ...consoleErrors].join(" | ")}`,
      );
    }
    const result = await page.evaluate(async () => {
      const api = (window as typeof window & {
        __HULIAN_SCAN_LAB__: BrowserLabApi;
      }).__HULIAN_SCAN_LAB__;
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
    expect(
      result.bad.events.filter((event) => event.type === "commit").length,
    ).toBeGreaterThan(0);
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
    await page.waitForFunction(() => "__HULIAN_SCAN_LAB__" in window);

    const result = await page.evaluate(async () => {
      const api = (window as typeof window & {
        __HULIAN_SCAN_LAB__: BrowserLabApi;
      }).__HULIAN_SCAN_LAB__;
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
