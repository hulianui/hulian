import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript-api";
import {
  CJK,
  parseBatchTranslation,
  protect,
  protectedTokens,
  restore,
  showcaseAstValues,
} from "./fetch-showcase-translations.mjs";

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

test("committed showcase copy covers repository AST literals with no duplicate keys", () => {
  const raw = readFileSync(copyFile, "utf8");
  const copy = JSON.parse(raw);
  const expected = [...showcaseAstValues()];
  const missing = expected.filter((key) => !Object.hasOwn(copy.exact, key));
  assert.deepEqual(
    missing,
    [],
    "every CJK-bearing literal line in the checked-out showcase source needs committed copy",
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

test("keeps executable date and countdown formats valid in exact and embedded code copy", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  const formats = new Map([
    ["YYYY 年 M 月 D 日", "MMM D, YYYY"],
    ["M 月 D 日 HH:mm", "MMM D, HH:mm"],
    ["D 天 HH:mm:ss", "D · HH:mm:ss"],
  ]);
  for (const [sourceFormat, englishFormat] of formats) {
    assert.equal(copy[sourceFormat], englishFormat);
    for (const [source, english] of Object.entries(copy)) {
      if (!source.includes(sourceFormat)) continue;
      assert.ok(english.includes(englishFormat), `${source} -> ${english}`);
      assert.doesNotMatch(english, /YYYY year|M Month D Day|D days HH:mm:ss/iu);
    }
  }
});

test("preserves regexes, URLs, API tokens, and parseable JSX code semantics", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  const regexLiteral = /pattern:\s*(\/(?:\\.|[^/\n])+\/[a-z]*)/gu;
  for (const [source, english] of Object.entries(copy)) {
    for (const match of source.matchAll(regexLiteral)) {
      assert.ok(english.includes(match[1]), `${source} -> ${english}; lost regex ${match[1]}`);
    }
    if (!source.trim().startsWith("<") || source.trim().startsWith("<!--")) continue;
    const wrap = (value) => `const showcase = (<>${value}</>);`;
    const sourceDiagnostics = ts.createSourceFile(
      "source.tsx",
      wrap(source),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ).parseDiagnostics;
    if (sourceDiagnostics.length > 0) continue;
    const englishDiagnostics = ts.createSourceFile(
      "english.tsx",
      wrap(english),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ).parseDiagnostics;
    assert.deepEqual(
      englishDiagnostics.map((diagnostic) => diagnostic.messageText),
      [],
      `${source} -> ${english}`,
    );
  }
});

test("locks identity, weekday, terminology, and fullwidth-symbol overrides", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  assert.equal(copy["李四"], "Li Si");
  for (const [source, english] of Object.entries(copy)) {
    if (!source.includes("李四")) continue;
    assert.match(english, /Li Si/u, `${source} -> ${english}`);
    assert.doesNotMatch(english, /John Doe/u, `${source} -> ${english}`);
  }
  assert.equal(
    copy['yLabels={["一", "二", "三", "四", "五", "六", "日"]}'],
    'yLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}',
  );
  assert.equal(copy["CI 流水线"], "CI pipeline");
  assert.equal(copy["禁用项"], "Disabled item");
  assert.equal(copy["含禁用项"], "Includes disabled items");
  assert.equal(copy["潮汐 Tide"], "Tide");
  assert.equal(copy["瑚琏 · HULIAN ·"], "HULIAN ·");
  assert.equal(copy["￥"], "¥");
  assert.equal(CJK.test("￥"), true, "the residue regex must include the fullwidth yen sign");
  assert.equal(CJK.test(copy["￥"]), false);
  for (const english of Object.values(copy)) {
    assert.doesNotMatch(english, /placeholder\s+placeholder|Tide\s+Tide|HULIAN\s*·\s*HULIAN/iu);
  }
});

test("rejects adjacent duplicate words and known machine-translation phrasing", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  const awkward = [
    /\b([A-Za-z][A-Za-z-]*)\s+\1\b/iu,
    /agent is being generated/iu,
    /cure the patch/iu,
    /transparently transmits?/iu,
    /degraded downgrade/iu,
  ];
  for (const [source, english] of Object.entries(copy)) {
    for (const pattern of awkward) {
      assert.doesNotMatch(english, pattern, `${source} -> ${english}`);
    }
  }
});
