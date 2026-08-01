#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const core = new Set(["button", "dialog", "form", "input", "select"]);
const heavy = new Set(["chart", "markdown-editor", "pro-table", "table", "tree", "virtual-list"]);

export function affectedScenarioIds(inventory, changedPaths) {
  const changedSlugs = new Set(
    changedPaths.flatMap((path) => {
      const match = path.match(/^packages\/ui\/src\/([^/]+)\//);
      return match?.[1] ? [match[1]] : [];
    }),
  );
  const sharedChange = changedPaths.some(
    (path) =>
      path.startsWith("packages/hulian-scan/") ||
      path.startsWith("packages/tokens/") ||
      path === "package.json" ||
      path === "pnpm-lock.yaml" ||
      /^packages\/ui\/src\/(?:lib|config|motion)\//.test(path),
  );
  return inventory
    .filter(
      (entry) =>
        entry.kind === "renderable" &&
        typeof entry.scenarioId === "string" &&
        (core.has(entry.id) ||
          heavy.has(entry.id) ||
          changedSlugs.has(entry.id) ||
          (sharedChange && (core.has(entry.id) || heavy.has(entry.id)))),
    )
    .map((entry) => entry.scenarioId)
    .sort((left, right) => left.localeCompare(right));
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(args) {
  const inventoryPath = valueAfter(args, "--inventory");
  if (!inventoryPath) throw new Error("--inventory requires a generated inventory JSON file");
  const base = valueAfter(args, "--base") ?? "HEAD^";
  const inventory = JSON.parse(await readFile(resolve(inventoryPath), "utf8"));
  const changed = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  const scenarios = affectedScenarioIds(inventory, changed);
  if (scenarios.length === 0) throw new Error("affected performance scan selected no scenarios");
  process.stdout.write(`${scenarios.join(",")}\n`);
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entry === import.meta.url) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
