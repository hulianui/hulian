import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript-api";
import {
  CJK,
  isHumanOnlyShowcaseText,
  parseBatchTranslation,
  protect,
  protectedTokens,
  restore,
  showcaseAstValues,
} from "./fetch-showcase-translations.mjs";

const copyFile = "apps/www/i18n/showcase-copy.en.json";
const executableFormats = new Map([
  ["YYYY 年 M 月 D 日", "MMM D, YYYY"],
  ["M 月 D 日 HH:mm", "MMM D, HH:mm"],
  ["D 天 HH:mm:ss", "D · HH:mm:ss"],
]);
const localizedProseTokens = new Map([
  [
    "卡片不指定 bgColor / textColor 时吃瑚琏 token，自动随明暗主题。",
    new Map([["token", "tokens"]]),
  ],
  ["默认吃瑚琏 chart token 渐变，自动适配明暗主题。", new Map([["chart token", "chart-token"]])],
  ["子元素沿圆周匀速环绕，中心放置标识/Logo。", new Map([["Logo", "logo"]])],
  ["GitHub 风格的 12 周活动热力，格子调小更紧凑。", new Map([["GitHub", "GitHub-style"]])],
  [
    "hideScrollbar 隐藏滚动条（内容仍可滚动），适合 ChatGPT 式沉浸聊天区。",
    new Map([["ChatGPT", "ChatGPT-style"]]),
  ],
]);

function occurrences(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function literalOccurrences(value, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const identifierLike = /^[A-Za-z0-9_$-]+$/u.test(token);
  const prefix = identifierLike
    ? /^\d/u.test(token)
      ? "(?<![A-Za-z0-9_$])"
      : "(?<![A-Za-z0-9_$-])"
    : "";
  const suffix = identifierLike ? "(?![A-Za-z0-9_$-])" : "";
  return [...value.matchAll(new RegExp(`${prefix}${escaped}${suffix}`, "gu"))].length;
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
  // 译文有两个来源：全局 exact，以及 gen-showcase-sources 优先命中的 per-file copy.files。
  // 只查 exact 会把「仅存在于某个组件 files 块里的词条」误判成缺译 —— 而那正是同一个词在
  // 不同组件里必须分别翻译时的唯一出路（math-text 的「分数」是 Fraction，别处是 Score）。
  // showcaseAstValues() 不带文件归属，按文件的严格校验由 `pnpm showcase:check` 负责。
  const fileKeys = new Set(Object.values(copy.files ?? {}).flatMap((entries) => Object.keys(entries)));
  const missing = expected.filter(
    (key) => !Object.hasOwn(copy.exact, key) && !fileKeys.has(key),
  );
  assert.deepEqual(
    missing,
    [],
    "every CJK-bearing literal line in the checked-out showcase source needs committed copy",
  );
  assert.deepEqual(duplicateTopLevelKeys(raw), []);
});

test("every English value is non-empty, CJK-free, and retains protected tokens", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8"));
  // 必须连 copy.files 一起查。per-file 覆盖是「同一个中文在不同组件里要不同译法」的
  // 唯一出路（math-text 的「分数」是 Fraction，评分组件里才是 Score），它们最终一样
  // 会渲染进英文站 —— 只查 exact 等于把这批译文放在质检之外。
  const entries = [
    ...Object.entries(copy.exact),
    ...Object.values(copy.files ?? {}).flatMap((block) => Object.entries(block)),
  ];
  for (const [source, english] of entries) {
    assert.equal(typeof english, "string", source);
    assert.notEqual(english.trim(), "", source);
    assert.equal(CJK.test(english), false, `${source} -> ${english}`);
    let tokenSource = [...executableFormats].reduce(
      (value, [sourceFormat, englishFormat]) => value.replaceAll(sourceFormat, englishFormat),
      source,
    );
    for (const [sourceToken, englishToken] of localizedProseTokens.get(source) ?? []) {
      tokenSource = tokenSource.replaceAll(sourceToken, englishToken);
    }
    const sourceTokens = occurrences(protectedTokens(tokenSource));
    for (const [token, count] of sourceTokens) {
      assert.ok(
        literalOccurrences(english, token) >= count,
        `protected token mismatch: ${source} -> ${english}; missing ${token}`,
      );
    }
  }
});

test("keeps executable date and countdown formats valid in exact and embedded code copy", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  for (const [sourceFormat, englishFormat] of executableFormats) {
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
  const humanAwkward = [
    /\b([A-Za-z][A-Za-z-]*)\s+\1\b/iu,
    /logo\s*\/\s*logo/iu,
    /dot\s*·\s*dot/iu,
    /solid\s*\/\s*dotted\s*\/\s*dotted/iu,
    /theme light\s+theme light/iu,
  ];
  const knownAwkward = [
    /agent is being generated/iu,
    /cure the patch/iu,
    /transparently transmits?/iu,
    /degraded downgrade/iu,
  ];
  for (const [source, english] of Object.entries(copy)) {
    const patterns = isHumanOnlyShowcaseText(source)
      ? [...humanAwkward, ...knownAwkward]
      : knownAwkward;
    for (const pattern of patterns) {
      assert.doesNotMatch(english, pattern, `${source} -> ${english}`);
    }
  }
});

test("treats prose comparison arrows as human text while preserving executable fragments", () => {
  assert.equal(
    isHumanOnlyShowcaseText(
      "dot 状态点 / startContent 图标 / avatar 头像三选一（优先级 avatar > startContent > dot）。",
    ),
    true,
  );
  assert.equal(
    isHumanOnlyShowcaseText(
      '<div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink 列表 */}</div>',
    ),
    false,
  );
});

test("locks final reviewed prose and Callout code-preview parity", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  const warningSource =
    '<Callout tone="warning" title="坑">直接改 node_modules 里的样式，下次安装会丢。</Callout>';
  const successSource =
    '<Callout tone="success" title="正解">用 pnpm patch 固化补丁，随 lockfile 走。</Callout>';

  assert.equal(copy["坑"], "Pit");
  assert.equal(copy["正解"], "Correct answer");
  assert.equal(
    copy[warningSource],
    `<Callout tone="warning" title="${copy["坑"]}">${copy["直接改 node_modules 里的样式，下次安装会丢。"]}</Callout>`,
  );
  assert.equal(
    copy[successSource],
    `<Callout tone="success" title="${copy["正解"]}">${copy["用 pnpm patch 固化补丁，随 lockfile 走。"]}</Callout>`,
  );
  assert.equal(copy["降级"], "Degraded");
  assert.equal(
    copy[
      "dot 状态点 / startContent 图标 / avatar 头像三选一（优先级 avatar > startContent > dot）。"
    ],
    "Choose one visual indicator: a dot, a startContent icon, or an avatar (priority: avatar > startContent > dot).",
  );
  assert.equal(
    copy["Statistic.Countdown 按 deadline 实时倒数，format 控制模板（支持 D/H/m/s/S）。"],
    "Statistic.Countdown counts down to the deadline in real time; format controls the display template (supports D/H/m/s/S).",
  );
  assert.equal(
    copy[
      '<ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="read">退款预计 1-3 个工作日到账。</ChatMessage>'
    ],
    '<ChatMessage role="user" name="Agent·Xiao Lian" timestamp="Just now" status="read">Refunds are expected to arrive in 1-3 working days.</ChatMessage>',
  );
  assert.equal(copy['avatar={<Avatar fallback="琏" />}'], 'avatar={<Avatar fallback="Lian" />}');
  assert.equal(
    copy['<ChatMessage role="user" name="我">帮我把首页重写成 100% dogfood</ChatMessage>'],
    '<ChatMessage role="user" name="Me">Help me rewrite the homepage to 100% dogfood</ChatMessage>',
  );
  assert.equal(
    copy['<StatusDot status="online" label="自动脉冲" />'],
    '<StatusDot status="online" label="Automatic pulse" />',
  );
  assert.equal(
    copy['<StatusDot status="degraded" label="强制脉冲" pulse />'],
    '<StatusDot status="degraded" label="Forced pulse" pulse />',
  );
  assert.equal(
    copy['<StatusDot status="online" label="关闭脉冲" pulse={false} />'],
    '<StatusDot status="online" label="Turn off pulse" pulse={false} />',
  );
});

test("keeps executable class tokens distinct from human-word repetition", () => {
  const copy = JSON.parse(readFileSync(copyFile, "utf8")).exact;
  const source = '<div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink 列表 */}</div>';
  assert.equal(
    copy[source],
    '<div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink list */}</div>',
  );
  assert.equal(literalOccurrences(copy[source], "grid"), 1);
  assert.equal(literalOccurrences(copy[source], "grid-cols-2"), 1);
});
