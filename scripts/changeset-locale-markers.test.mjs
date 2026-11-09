import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const START = "<!-- changelog-en:start -->";
const END = "<!-- changelog-en:end -->";
const LOCALIZED = new Set(["@hulianui/ui", "@hulianui/tokens"]);

function pendingChangesets() {
  return readdirSync(join(ROOT, ".changeset"))
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => ({ name, text: readFileSync(join(ROOT, ".changeset", name), "utf8") }));
}

function localizedPackages(text) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return [];
  return [...frontmatter[1].matchAll(/"(@hulianui\/[^"]+)":/g)]
    .map((match) => match[1])
    .filter((name) => LOCALIZED.has(name));
}

test("ui and tokens changesets carry one English marker pair", () => {
  const files = pendingChangesets().filter((file) => localizedPackages(file.text).length > 0);
  assert.ok(files.length > 0);
  for (const file of files) {
    const starts = file.text.split(START).length - 1;
    const ends = file.text.split(END).length - 1;
    assert.equal(starts, 1, file.name);
    assert.equal(ends, 1, file.name);
    const english = file.text.slice(file.text.indexOf(START) + START.length, file.text.indexOf(END)).trim();
    assert.ok(english.length > 0, file.name);
    assert.doesNotMatch(english, /\p{Script=Han}/u, file.name);
  }
});
