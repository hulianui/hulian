import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { auditFixtureEnglish } from "./check-fixture-english.mjs";
import { translateFixtureModule } from "./gen-fixture-sources.mjs";

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

test("contextual English inventory covers every generated fixture module", () => {
  const contexts = readJson("apps/www/app/fixture-context.en.json");
  const fixtureFiles = (relative) =>
    readdirSync(new URL(`../${relative}`, import.meta.url))
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".en.tsx"))
      .sort();

  assert.deepEqual(
    Object.keys(contexts.blocks).sort(),
    fixtureFiles("apps/www/app/blocks/_blocks"),
  );
  assert.deepEqual(Object.keys(contexts.pages).sort(), fixtureFiles("apps/www/app/pages/_pages"));

  for (const [kind, directory, copyFile] of [
    ["block", "apps/www/app/blocks/_blocks", "apps/www/app/blocks/block-fixtures.en.json"],
    ["page", "apps/www/app/pages/_pages", "apps/www/app/pages/page-fixtures.en.json"],
  ]) {
    const copy = readJson(copyFile);
    const area = `${kind}s`;
    for (const [file, overrides] of Object.entries(contexts[area])) {
      const source = readFileSync(new URL(`../${directory}/${file}`, import.meta.url), "utf8");
      assert.doesNotThrow(() => translateFixtureModule(source, file, copy, kind, overrides));
    }
  }

  const contextualEnglish = Object.fromEntries(
    Object.entries(contexts.blocks)
      .concat(Object.entries(contexts.pages))
      .flatMap(([file, overrides]) =>
        Object.entries(overrides)
          .filter(([, target]) => target !== "")
          .map(([source, target]) => [`${file}:${source}`, target]),
      ),
  );
  assert.deepEqual(auditFixtureEnglish(contextualEnglish), []);
});

test("generated fixtures preserve known contextual compositions and proper names", () => {
  const readGenerated = (relative) =>
    readFileSync(
      new URL(`../apps/www/app/blocks/_blocks/${relative}.en.tsx`, import.meta.url),
      "utf8",
    );

  assert.match(
    readGenerated("hero"),
    /Deploy your app to the <AuroraText>global edge<\/AuroraText>/,
  );
  assert.match(readGenerated("hero"), /with a single git push/);
  assert.match(readGenerated("chart-grid"), /channel: "Phone"/);
  assert.match(readGenerated("chart-grid"), /channel: "Partners"/);
  assert.match(readGenerated("chart-grid"), /name: "Gao Min"/);
  assert.match(readGenerated("chart-grid"), /New customers by channel/);
  assert.match(readGenerated("chat-panel"), /duration="Thought for 2.1s"/);
  assert.match(readGenerated("about"), /title: "Peak performance"/);
  assert.match(readGenerated("prompt-input"), /title="Try one of these prompts"/);
  assert.match(readGenerated("cart-summary"), /Premium Reversible Mulberry Silk Pillowcase/);
  assert.match(readGenerated("agent-card"), /healthy: "Healthy"/);
  assert.match(readGenerated("agent-card"), /degraded: "Degraded"/);
  assert.match(readGenerated("user-profile"), /fallback="U"/);
  assert.match(readGenerated("signup"), /Terms of Service[\s\S]*and[\s\S]*Privacy Policy/);
  assert.match(
    readGenerated("product-grid"),
    /Ergonomic Office Chair with Adjustable Lumbar Support/,
  );
  assert.match(readGenerated("product-grid"), /3-Piece Quick-Dry Bamboo Bath Towel Set/);
  assert.match(readGenerated("product-grid"), /16-Piece Nordic Ceramic Dinnerware Set/);
  assert.match(readGenerated("product-grid"), /Gooseneck Pour-Over Coffee Set/);
  assert.match(readGenerated("user-profile"), /3-Piece Quick-Dry Bamboo Bath Towel Set/);
});
