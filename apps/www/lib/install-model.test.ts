import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { blocks } from "../app/blocks/_meta";
import { pages } from "../app/pages/_meta";
import {
  buildInstallModel,
  depHrefOf,
  depNameOf,
  itemUrlOf,
  type RegistryItem,
  type RegistryMeta,
} from "./install-model";

// 一致性门禁：详情页安装面板展示的每一项，必须与站点真正发出去的 /r/<item>.json 对得上。
//
// 这不是形式测试 —— 面板一旦改成「从 _meta 再算一遍」而不是读 registry 产物，
// 两边就会在下一次改元数据时静默分叉：页面上写着要装 3 个区块，CLI 实际装 2 个。
// 所以断言全部对着**磁盘上的真实产物**跑。

const PUBLIC = join(process.cwd(), "public");
const hasArtifacts = existsSync(join(PUBLIC, "registry.json"));
const read = (p: string) => JSON.parse(readFileSync(join(PUBLIC, p), "utf8"));

// /r 与 registry.json 是构建期生成物（被 git 忽略）。干净 checkout 里跑单测时它们可能不在，
// 此时跳过而不是假绿——CI 在 `pnpm llms-registry` 之后才跑 test，覆盖是真实的。
const maybe = hasArtifacts ? describe : describe.skip;

maybe("安装面板与 registry 产物一致", () => {
  const registry = read("registry.json") as RegistryMeta;
  const load = (name: string) => read(`r/${name}.json`) as RegistryItem;

  const cases = [
    ...blocks.map((b) => ({ kind: "block" as const, slug: b.slug, name: `block-${b.slug}`, meta: b })),
    ...pages.map((p) => ({ kind: "page" as const, slug: p.slug, name: `page-${p.slug}`, meta: p })),
  ];

  it("每个区块/页面都有对应的 registry 单件端点", () => {
    const missing = cases.filter((c) => !existsSync(join(PUBLIC, "r", `${c.name}.json`)));
    expect(missing.map((c) => c.name)).toEqual([]);
  });

  it("安装命令指向 registry.json 声明的单件端点（不另造域名）", () => {
    for (const c of cases) {
      const model = buildInstallModel(load(c.name), registry);
      expect(model.command).toBe(`npx shadcn@latest add ${itemUrlOf(registry, c.name)}`);
      expect(model.itemUrl.endsWith(`/r/${c.name}.json`)).toBe(true);
    }
  });

  it("Provider / 必须替换 / 插槽 三项与 _meta 声明逐字一致", () => {
    for (const c of cases) {
      const model = buildInstallModel(load(c.name), registry);
      expect(model.providers, c.name).toEqual(c.meta.installation.providers);
      expect(model.replace, c.name).toEqual(c.meta.installation.replace);
      expect(model.slots, c.name).toEqual(c.meta.installation.slots);
    }
  });

  it("写入文件与 npm 依赖直接取自 registry item", () => {
    for (const c of cases) {
      const item = load(c.name);
      const model = buildInstallModel(item, registry);
      expect(model.targets, c.name).toEqual((item.files ?? []).map((f) => f.target || f.path));
      expect(model.npmDeps, c.name).toEqual(item.dependencies ?? []);
    }
  });

  it("guard 命令覆盖全部写入文件（装完就能原样验）", () => {
    for (const c of cases) {
      const model = buildInstallModel(load(c.name), registry);
      expect(model.guardCommand.startsWith("npx -y @hulianui/guard "), c.name).toBe(true);
      for (const t of model.targets) expect(model.guardCommand).toContain(t);
    }
  });

  it("页面的递归依赖全部指向站内真实存在的区块详情页", () => {
    const blockSlugs = new Set(blocks.map((b) => b.slug));
    for (const c of cases) {
      const item = load(c.name);
      const model = buildInstallModel(item, registry);
      expect(model.registryDeps.map((d) => d.name)).toEqual(
        (item.registryDependencies ?? []).map(depNameOf),
      );
      for (const dep of model.registryDeps) {
        expect(dep.href, `${c.name} → ${dep.name}`).toBe(depHrefOf(dep.name));
        if (dep.href?.startsWith("/blocks/")) {
          expect(blockSlugs.has(dep.href.slice("/blocks/".length)), dep.name).toBe(true);
        }
      }
    }
  });

  it("issue #40 点名的 page-admin-list：3 个递归区块 + ThemeProvider + 三个插槽", () => {
    const model = buildInstallModel(load("page-admin-list"), registry, {
      "block-data-table": "数据表格页",
    });
    expect(model.registryDeps.map((d) => d.name)).toEqual([
      "block-data-table",
      "block-kpi-rail",
      "block-page-header",
    ]);
    expect(model.registryDeps[0].title).toBe("数据表格页");
    expect(model.providers).toEqual(["ThemeProvider"]);
    expect(model.slots).toEqual(["data-table", "kpi-rail", "page-header"]);
    expect(model.selfContained).toBe(false);
    expect(model.targets).toEqual(["components/hulianui/pages/admin-list.tsx"]);
  });

  it("issue #40 点名的 block-data-table：明确列出 copy / event-handlers / mock-data 必须替换", () => {
    const model = buildInstallModel(load("block-data-table"), registry);
    expect(model.replace).toEqual(["copy", "event-handlers", "mock-data"]);
    expect(model.selfContained).toBe(true);
  });
});

describe("纯推导函数", () => {
  it("依赖 URL → item 名 → 站内详情页", () => {
    expect(depNameOf("https://x/r/block-data-table.json")).toBe("block-data-table");
    expect(depHrefOf("block-data-table")).toBe("/blocks/data-table");
    expect(depHrefOf("page-admin-list")).toBe("/pages/admin-list");
    // 组件内部模块在站里没有区块/页面详情页 —— 不能瞎编链接。
    expect(depHrefOf("lib")).toBe(null);
  });

  it("itemUrl 走 registry.json 的模板，不硬编码域名", () => {
    expect(itemUrlOf({ version: "0", itemUrl: "https://a/r/{name}.json", install: "" }, "x")).toBe(
      "https://a/r/x.json",
    );
  });

  it("无文件的 item 不产出空 guard 命令（避免给出一条跑起来扫全仓的命令）", () => {
    const model = buildInstallModel({ name: "x", type: "registry:block" }, {
      version: "0",
      itemUrl: "https://a/r/{name}.json",
      install: "",
    });
    expect(model.guardCommand).toBe("");
  });
});
