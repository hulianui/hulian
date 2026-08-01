#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function runForwarder(argv, spawn = spawnSync) {
  const result = spawn(
    "pnpm",
    ["--filter", "@hulianui/hulian-scan", "run", "scan:internal", "--", ...argv],
    { stdio: "inherit" },
  );
  return result.status ?? 1;
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entry === import.meta.url) {
  process.exitCode = runForwarder(process.argv.slice(2));
}
