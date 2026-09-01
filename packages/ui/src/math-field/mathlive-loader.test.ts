import { afterEach, describe, expect, it, vi } from "vitest";

// 每个用例都要重置模块缓存：loader 内部缓存 promise，vi.doMock 只对下一次 import 生效。
afterEach(() => {
  vi.doUnmock("mathlive");
  vi.resetModules();
});

async function load() {
  const mod = await import("./mathlive-loader");
  mod.resetMathLiveLoaderForTests();
  return mod;
}

describe("loadMathLive", () => {
  it("模块解析失败（没装 mathlive）→ MathLiveUnavailableError，消息带安装命令", async () => {
    vi.doMock("mathlive", () => {
      throw new Error("Cannot find package 'mathlive'");
    });
    const { loadMathLive, MathLiveUnavailableError, MATHLIVE_INSTALL_HINT } = await load();
    await expect(loadMathLive()).rejects.toBeInstanceOf(MathLiveUnavailableError);
    await expect(loadMathLive()).rejects.toThrow(MATHLIVE_INSTALL_HINT);
  });

  it("解析到 SSR 构建（有模块没有 MathfieldElement）也算不可用", async () => {
    vi.doMock("mathlive", () => ({ convertLatexToMarkup: () => "" }));
    const { loadMathLive, MathLiveUnavailableError } = await load();
    await expect(loadMathLive()).rejects.toBeInstanceOf(MathLiveUnavailableError);
  });

  it("成功：关掉音效与字体目录，注册自定义元素，且同一 promise 复用", async () => {
    class Fake extends HTMLElement {
      static soundsDirectory: string | null = "./sounds";
      static fontsDirectory: string | null = "./fonts";
    }
    vi.doMock("mathlive", () => ({ MathfieldElement: Fake }));
    const { loadMathLive } = await load();
    const p1 = loadMathLive();
    const p2 = loadMathLive();
    expect(p1).toBe(p2);
    const mod = await p1;
    expect(mod.MathfieldElement).toBe(Fake);
    expect(Fake.soundsDirectory).toBeNull();
    expect(Fake.fontsDirectory).toBeNull();
    expect(customElements.get("math-field")).toBe(Fake);
  });

  it("失败后不缓存：下一次调用重新 import（拒绝的 promise 不是同一个）", async () => {
    vi.doMock("mathlive", () => ({}));
    const { loadMathLive } = await load();
    const first = loadMathLive();
    await expect(first).rejects.toThrow();
    const again = loadMathLive();
    expect(again).not.toBe(first);
    await expect(again).rejects.toThrow();
  });
});
