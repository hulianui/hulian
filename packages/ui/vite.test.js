// `vite.js` 与 `vitest-preset.js` 一样住在包根、不在 `tsconfig.json` 的 `include` 里，
// 因此 `pnpm typecheck` **完全看不到它们** —— 没有测试的话，这两个对外发布的入口
// 就是零覆盖。这份测试补的是 vite.js 那一半。
import { describe, it, expect, vi } from "vitest";
import { hulian } from "./vite.js";

/** 取插件的 config 钩子返回值（Vite 会把它深合并进最终配置）。 */
const runConfig = (plugin) => plugin.config.call({}, {}, { command: "serve", mode: "development" });

describe("@hulianui/ui/vite", () => {
  it("返回合法的 Vite 插件，且只在 serve 阶段生效", () => {
    const p = hulian();
    expect(p.name).toBe("hulianui:dev");
    // build 时预打包既无必要也会碍事 —— 漏了 apply 会让它跟着 build 一起跑。
    expect(p.apply).toBe("serve");
    expect(typeof p.config).toBe("function");
  });

  it("prebundle: true —— 强制注入 optimizeDeps.include", () => {
    const cfg = runConfig(hulian({ prebundle: true, silent: true }));
    expect(cfg).toEqual({ optimizeDeps: { include: ["@hulianui/ui"] } });
  });

  it("prebundle: false —— 什么都不注入（换回库源码的 HMR）", () => {
    expect(runConfig(hulian({ prebundle: false, silent: true }))).toBeUndefined();
  });

  it("默认 auto —— 在仓库内跑即软链形态，应当注入", () => {
    // 本测试跑在 packages/ui 里，vite.js 的 realpath 是 <仓库>/packages/ui/vite.js，
    // 不含 node_modules —— 这正是「软链消费」的判据形态，等价于下游 link: 过来的样子。
    const cfg = runConfig(hulian({ silent: true }));
    expect(cfg?.optimizeDeps?.include).toContain("@hulianui/ui");
  });

  it("每次返回**新的** include 数组，消费方 push 不会污染下一次", () => {
    const a = runConfig(hulian({ prebundle: true, silent: true }));
    a.optimizeDeps.include.push("污染");
    const b = runConfig(hulian({ prebundle: true, silent: true }));
    expect(b.optimizeDeps.include).toEqual(["@hulianui/ui"]);
  });

  it("silent: true —— 不打印诊断", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const p = hulian({ prebundle: true, silent: true });
    runConfig(p);
    p.configResolved.call({}, {});
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("默认会打印一行诊断，说明做了什么以及代价", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const p = hulian({ prebundle: true });
    runConfig(p);
    p.configResolved.call({}, {});
    expect(spy).toHaveBeenCalledOnce();
    const msg = spy.mock.calls[0][0];
    expect(msg).toContain("hulianui");
    // 诊断必须同时说清「做了什么」和「代价是什么」，否则用户不知道 HMR 为何失灵。
    expect(msg).toContain("预打包");
    expect(msg).toContain("HMR");
    spy.mockRestore();
  });
});
