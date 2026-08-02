import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("reads build-time registry artifacts from HULIAN_REGISTRY_OUT", async () => {
  const root = await mkdtemp(join(tmpdir(), "hulian-registry-source-"));
  try {
    await mkdir(join(root, "r"), { recursive: true });
    await writeFile(
      join(root, "registry.json"),
      JSON.stringify({ version: "test", itemUrl: "/r/{name}.json", install: "test" }),
    );
    await writeFile(
      join(root, "r", "block-navbar.json"),
      JSON.stringify({ name: "block-navbar", title: "Navbar" }),
    );
    vi.stubEnv("HULIAN_REGISTRY_OUT", root);
    vi.resetModules();

    const source = await import("./registry-source");

    expect(source.readRegistryMeta()).toEqual({
      version: "test",
      itemUrl: "/r/{name}.json",
      install: "test",
    });
    expect(source.readRegistryItem("block-navbar")).toMatchObject({
      name: "block-navbar",
      title: "Navbar",
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
