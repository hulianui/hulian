import assert from "node:assert/strict";
import test from "node:test";

import { generatedEnglishRegistry, translateFixtureModule } from "./gen-fixture-sources.mjs";

const copy = {
  "保存设置": "Save settings",
  "提交失败": "Submission failed",
  "去结算": "Check out",
  "件商品，共": "items, totaling",
};

test("generation localizes source literals without a runtime translation adapter", () => {
  const source = `/** @jsxImportSource ../../../lib/fixture-jsx */
    import { Button, toast } from "../../../lib/fixture-ui";
    import { translateFixtureText } from "../../../lib/fixture-copy";
    export function Fixture() {
      const [value, setValue] = useState("保存设置");
      return <Button title="提交失败" onClick={() => toast({ title: value })}>{value}</Button>;
    }`;

  const english = translateFixtureModule(source, "fixture.tsx", copy, "block");
  assert.match(english, /useState\("Save settings"\)/);
  assert.match(english, /title="Submission failed"/);
  assert.doesNotMatch(english, /fixture-(?:jsx|ui|copy)|translateFixture/);
  assert.doesNotMatch(english, /[ \t]+$/m);
  assert.match(english, /from "@hulianui\/ui"/);
  assert.equal(english, translateFixtureModule(source, "fixture.tsx", copy, "block"));
});

test("generated English page modules import generated English block modules", () => {
  const source = `import { HeroBlock } from "../../blocks/_blocks/hero";
    export function LandingPage() { return <HeroBlock />; }`;
  const english = translateFixtureModule(source, "landing.tsx", copy, "page");
  assert.match(english, /from "\.\.\/\.\.\/blocks\/_blocks\/hero\.en"/);
});

test("generation preserves source whitespace around translated template fragments", () => {
  const source = "const message = `去结算 ${count} 件商品，共 ${total}`;";
  const english = translateFixtureModule(source, "cart.tsx", copy, "block");

  assert.match(english, /`Check out \$\{count\} items, totaling \$\{total\}`/);
});

test("generated English registries remove source-only Chinese comments", () => {
  const source = `import { DOCS_LOCALE } from "../../lib/docs-locale";
    import { blockPreviews as englishBlockPreviews } from "./_registry.en";
    import { Hero } from "./_blocks/hero";
    // 区块注册表
    const chineseBlockPreviews = { hero: <Hero /> };
    export const blockPreviews = DOCS_LOCALE === "en" ? englishBlockPreviews : chineseBlockPreviews;
  `;

  const english = generatedEnglishRegistry(source, "block");
  assert.doesNotMatch(english, /[\p{Script=Han}]/u);
  assert.doesNotMatch(english, /[ \t]+$/m);
  assert.match(english, /[^\n]\n$/);
  assert.match(english, /from "\.\/_blocks\/hero\.en"/);
});
