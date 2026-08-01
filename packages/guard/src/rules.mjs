import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function loadConventions(configPath) {
  const file = configPath ? resolve(configPath) : join(PACKAGE_ROOT, "conventions.json");
  if (!existsSync(file)) throw new Error(`找不到 conventions 配置: ${file}`);
  const conventions = JSON.parse(readFileSync(file, "utf8"));
  if (conventions.version !== "2" || !Array.isArray(conventions.executableRules)) {
    throw new Error(`不支持的 conventions schema: ${conventions.version ?? "unknown"}`);
  }
  return conventions;
}
