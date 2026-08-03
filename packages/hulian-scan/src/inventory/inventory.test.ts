import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildInventory, scenarioIdFor, type InventoryPaths } from "./inventory";

async function fixturePaths(): Promise<InventoryPaths> {
  const root = await mkdtemp(join(tmpdir(), "hulian-scan-inventory-"));
  const sourceRoot = join(root, "src");
  await mkdir(join(sourceRoot, "button"), { recursive: true });
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      exports: {
        ".": "./src/index.ts",
        "./showcase": "./src/showcase.ts",
        "./vite": "./vite.js",
        "./*": "./src/*/index.ts",
      },
    }),
  );
  await writeFile(
    join(sourceRoot, "index.ts"),
    ['export * from "./button";', 'export { Button as ButtonAlias } from "./button";'].join("\n"),
  );
  await writeFile(
    join(sourceRoot, "showcase.ts"),
    'export { buttonShowcase } from "./button/button.showcase";\n',
  );
  await writeFile(
    join(sourceRoot, "button", "index.ts"),
    [
      'export { Button, buttonVariants } from "./button";',
      'export type { ButtonProps } from "./button.types";',
    ].join("\n"),
  );
  await writeFile(
    join(sourceRoot, "button", "button.showcase.tsx"),
    "export const buttonShowcase = {};\n",
  );
  await writeFile(join(sourceRoot, "button", "button.md"), "# Button\n");
  await writeFile(
    join(root, "registry.json"),
    JSON.stringify({
      items: [
        {
          name: "button",
          categories: ["actions"],
          meta: {
            exports: ["Button", "buttonVariants"],
            group: "input",
            animated: false,
            webgl: false,
            docLocal: join(sourceRoot, "button", "button.md"),
          },
        },
      ],
    }),
  );
  return {
    packageJson: join(root, "package.json"),
    rootIndex: join(sourceRoot, "index.ts"),
    showcaseIndex: join(sourceRoot, "showcase.ts"),
    sourceRoot,
    registryJson: join(root, "registry.json"),
    nonRendering: [
      {
        entry: "@hulianui/ui/showcase",
        reason: "Showcase metadata barrel, not a component entry",
      },
      { entry: "@hulianui/ui/vite", reason: "Vite plugin, no React render export" },
    ],
  };
}

describe("buildInventory", () => {
  it("routes heavy and animation entries to deterministic specialized scenarios", () => {
    expect(scenarioIdFor("table", false, false)).toBe("table/stress");
    expect(scenarioIdFor("virtual-list", false, false)).toBe("virtual-list/scroll");
    expect(scenarioIdFor("animated-beam", true, false)).toBe("animated-beam/frame-budget");
    expect(scenarioIdFor("button", false, false)).toBe("button/basic");
  });

  it("maps public renderable exports, aliases, and explicit non-rendering entries", async () => {
    const inventory = await buildInventory(await fixturePaths());
    const renderable = inventory.filter((entry) => entry.kind === "renderable");

    expect(renderable).toHaveLength(1);
    expect(renderable[0]).toEqual(
      expect.objectContaining({
        id: "button",
        entry: "@hulianui/ui/button",
        exports: ["Button", "buttonVariants"],
        aliases: ["ButtonAlias"],
        categories: ["actions", "input"],
        scenarioId: "button/basic",
      }),
    );
    expect(inventory.find((entry) => entry.entry.endsWith("/vite"))?.reason).toMatch(/Vite plugin/);
  });

  it("rejects a public entry without a scenario or an explicit reason", async () => {
    const paths = await fixturePaths();
    paths.nonRendering = paths.nonRendering.filter((entry) => !entry.entry.endsWith("/vite"));

    await expect(buildInventory(paths)).rejects.toThrow(/unclassified public entry.*vite/i);
  });

  it("rejects disagreement between AST exports and generated registry facts", async () => {
    const paths = await fixturePaths();
    await writeFile(
      paths.registryJson,
      JSON.stringify({
        items: [
          {
            name: "button",
            categories: ["actions"],
            meta: {
              exports: ["DifferentButton"],
              group: "input",
              animated: false,
              webgl: false,
              docLocal: join(paths.sourceRoot, "button", "button.md"),
            },
          },
        ],
      }),
    );

    await expect(buildInventory(paths)).rejects.toThrow(/registry exports.*button/i);
  });
});
