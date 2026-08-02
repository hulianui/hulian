import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CJK,
  inventoryValues,
  parseBatchTranslation,
  protect,
  protectedTokens,
  restore,
} from "./fetch-showcase-translations.mjs";

const inventoryFile = process.env.SHOWCASE_CJK_INVENTORY ?? "/tmp/showcase-cjk-inventory.json";
const copyFile = "apps/www/i18n/showcase-copy.en.json";

function occurrences(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function duplicateTopLevelKeys(json) {
  const keys = [...json.matchAll(/^    ("(?:\\.|[^"\\])*"):/gmu)].map((match) =>
    JSON.parse(match[1]),
  );
  return [...occurrences(keys)].filter(([, count]) => count > 1).map(([key]) => key);
}

test("protects and restores API identifiers, placeholders, and URLs byte-for-byte", () => {
  const source = "用 defaultValue、${item.id} 和 %s 打开 https://example.com/a?q=1";
  const secured = protect(source);
  assert.deepEqual(protectedTokens(source), [
    "defaultValue",
    "${item.id}",
    "%s",
    "https://example.com/a?q=1",
  ]);
  assert.equal(restore(secured.text, secured.tokens), source);
});

test("parses uniquely identified batched translations without depending on line wrapping", () => {
  const entries = [
    { id: 7, text: "one" },
    { id: 11, text: "two" },
  ];
  assert.deepEqual(
    [...parseBatchTranslation("⟦HL000007⟧ First\nline\n⟦HL000011⟧ Second", entries)],
    [
      [7, "First\nline"],
      [11, "Second"],
    ],
  );
  assert.throws(() => parseBatchTranslation("⟦HL000007⟧ First", entries), /marker mismatch/);
});

test("committed showcase copy exactly covers the current inventory with no unused or duplicate keys", () => {
  const inventory = JSON.parse(readFileSync(inventoryFile, "utf8"));
  const raw = readFileSync(copyFile, "utf8");
  const copy = JSON.parse(raw);
  const expected = inventoryValues(inventory);
  const actual = Object.keys(copy.exact);
  assert.deepEqual(
    actual,
    expected,
    "translation keys must be sorted and exactly match the inventory",
  );
  assert.deepEqual(duplicateTopLevelKeys(raw), []);
});

test("every English value is non-empty, CJK-free, and retains protected tokens", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8"));
  for (const [source, english] of Object.entries(copy.exact)) {
    assert.equal(typeof english, "string", source);
    assert.notEqual(english.trim(), "", source);
    assert.equal(CJK.test(english), false, `${source} -> ${english}`);
    const sourceTokens = occurrences(protectedTokens(source));
    for (const [token, count] of sourceTokens) {
      assert.ok(
        english.split(token).length - 1 >= count,
        `protected token mismatch: ${source} -> ${english}; missing ${token}`,
      );
    }
  }
});
