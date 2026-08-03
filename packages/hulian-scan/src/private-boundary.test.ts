import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { repositoryRoot } from "./paths";

const forbidden = ["hulian-scan", "react-scan", "bippy", "why-did-you-render"];

describe("private instrumentation boundary", () => {
  it("keeps scanner dependencies out of the public UI package and its lockfile importer", async () => {
    const scanner = JSON.parse(
      await readFile(join(repositoryRoot, "packages/hulian-scan/package.json"), "utf8"),
    ) as { private?: boolean };
    const ui = JSON.parse(
      await readFile(join(repositoryRoot, "packages/ui/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string>; exports?: Record<string, unknown> };
    const lockfile = await readFile(join(repositoryRoot, "pnpm-lock.yaml"), "utf8");
    const uiImporter = lockfile.match(/\n  packages\/ui:\n([\s\S]*?)(?=\n  \S|\npackages:)/)?.[1];

    expect(scanner.private).toBe(true);
    expect(uiImporter, "packages/ui lockfile importer must exist").toBeTruthy();
    const publicSurface = JSON.stringify({ dependencies: ui.dependencies, exports: ui.exports });
    for (const name of forbidden) {
      expect(publicSurface).not.toContain(name);
      expect(uiImporter).not.toContain(name);
    }
  });
});
