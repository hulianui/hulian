import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { auditFixtureEnglish } from "./check-fixture-english.mjs";

const readJson = (relative) =>
  JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), "utf8"));

test("rejects known machine-translation failure modes", () => {
  const findings = auditFixtureEnglish({
    a: "the data will not be forced to be cut off",
    b: "Poor",
    c: "If you don't want to flood, unsubscribe.",
    d: "The page is lost",
  });
  assert.equal(findings.length, 4);
});

test("all canonical fixture values pass the English editorial gate", () => {
  const blocks = readJson("apps/www/app/blocks/block-fixtures.en.json");
  const pages = readJson("apps/www/app/pages/page-fixtures.en.json");

  assert.equal(Object.keys(blocks).length, 1056);
  assert.equal(Object.keys(pages).length, 58);
  assert.deepEqual(auditFixtureEnglish(blocks), []);
  assert.deepEqual(auditFixtureEnglish(pages), []);
});
