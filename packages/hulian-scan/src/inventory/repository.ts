import { join } from "node:path";

import { repositoryRoot } from "../paths";
import { buildInventory, type InventoryEntry, type InventoryPaths } from "./inventory";

export function repositoryInventoryPaths(): InventoryPaths {
  const uiRoot = join(repositoryRoot, "packages/ui");
  return {
    packageJson: join(uiRoot, "package.json"),
    rootIndex: join(uiRoot, "src/index.ts"),
    showcaseIndex: join(uiRoot, "src/showcase.ts"),
    sourceRoot: join(uiRoot, "src"),
    registryJson: join(repositoryRoot, "apps/www/public/registry.json"),
    workspaceRoot: repositoryRoot,
    nonRendering: [
      {
        entry: "@hulianui/ui/access",
        reason: "Access providers and authorization helpers have no standalone visual showcase",
      },
      {
        entry: "@hulianui/ui/config",
        reason: "Configuration provider and locale helpers have no standalone visual showcase",
      },
      {
        entry: "@hulianui/ui/lib",
        reason: "Utility-only entry with no React render surface",
      },
      {
        entry: "@hulianui/ui/motion",
        reason: "Motion primitives and provider infrastructure have no standalone showcase",
      },
      {
        entry: "@hulianui/ui/showcase",
        reason: "Showcase metadata barrel, not a component entry",
      },
      {
        entry: "@hulianui/ui/theme",
        reason: "Theme provider and hooks have no standalone visual showcase",
      },
      {
        entry: "@hulianui/ui/vite",
        reason: "Vite plugin, no React render export",
      },
      {
        entry: "@hulianui/ui/vitest-preset",
        reason: "Vitest preset, no React render export",
      },
    ],
  };
}

export async function buildRepositoryInventory(): Promise<InventoryEntry[]> {
  return buildInventory(repositoryInventoryPaths());
}
