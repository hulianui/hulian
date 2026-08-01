#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function runForwarder(argv, spawn = spawnSync, environment = process.env) {
  const packedConsumer = argv.some(
    (argument, index) => argument === "--environment" && argv[index + 1] === "packed-consumer",
  );
  const result =
    packedConsumer && !environment.HULIAN_SCAN_LAB_DIR
      ? spawn("bash", ["scripts/performance-consumer.sh", ...argv], { stdio: "inherit" })
      : spawn(
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
