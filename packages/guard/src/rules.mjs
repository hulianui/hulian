import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadConventions(configPath) {
  const bundledFile = join(PACKAGE_ROOT, "conventions.json");
  const bundled = readConventions(bundledFile);
  if (!configPath) return bundled;

  const custom = readConventions(resolve(configPath));
  const builtInById = new Map(bundled.executableRules.map((rule) => [rule.id, rule]));
  const additions = [];
  for (const rule of custom.executableRules) {
    const builtIn = builtInById.get(rule.id);
    if (!builtIn) {
      additions.push(rule);
    } else if (JSON.stringify(builtIn) !== JSON.stringify(rule)) {
      throw new Error(`自定义 conventions 不能覆盖内置规则: ${rule.id}`);
    }
  }
  return {
    ...custom,
    executableRules: [...bundled.executableRules, ...additions],
  };
}

function readConventions(file) {
  if (!existsSync(file)) throw new Error(`找不到 conventions 配置: ${file}`);
  const conventions = JSON.parse(readFileSync(file, "utf8"));
  if (conventions.version !== "2" || !Array.isArray(conventions.executableRules)) {
    throw new Error(`不支持的 conventions schema: ${conventions.version ?? "unknown"}`);
  }
  return conventions;
}
