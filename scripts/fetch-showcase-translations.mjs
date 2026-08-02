import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

export const CJK = /[\p{Script=Han}\u3000-\u303f\uff00-\uffef]/u;

const TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const DEFAULT_INVENTORY = "/tmp/showcase-cjk-inventory.json";
const DEFAULT_OUTPUT = "apps/www/i18n/showcase-copy.en.json";
const DEFAULT_CACHE = "/tmp/hulian-showcase-translation-cache.json";
const DEFAULT_RAW_CACHE = "/tmp/hulian-showcase-translation-raw-cache.json";
const MARKER = /⟦HL(\d{6})⟧/gu;
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_SHOWCASE_ROOT = join(REPO_ROOT, "packages/ui/src");
const MANUAL_COPY = new Map([
  [" 号店", " Store"],
  ["号店", "Store"],
  ["名", "Name"],
  ["￥", "¥"],
  ["YYYY 年 M 月 D 日", "MMM D, YYYY"],
  ["M 月 D 日 HH:mm", "MMM D, HH:mm"],
  ["D 天 HH:mm:ss", "D · HH:mm:ss"],
  ["李四", "Li Si"],
  ["CI 流水线", "CI pipeline"],
  ["禁用项", "Disabled item"],
  ["含禁用项", "Includes disabled items"],
  ["多选支付方式（含禁用项）", "Multiple payment methods (includes disabled items)"],
  ["default（收起·点汉堡展开）", "default (collapsed · click the menu button to expand)"],
  [
    "顶栏汉堡 / 品牌 / CTA，点汉堡整条胶囊展开，内部卡片逐张错峰浮现。非受控时组件自管开合，点汉堡即可展开。",
    "The top bar contains a menu button, brand, and CTA. Click the menu button to expand the capsule and reveal each card in sequence. In uncontrolled mode, the component manages its own open state.",
  ],
  [
    "最简输入框，传 placeholder 占位。",
    "A minimal input; use placeholder for empty-state guidance.",
  ],
  [
    "items 提供选项数据，placeholder 作占位。",
    "items provides the options; placeholder supplies the empty-state prompt.",
  ],
  ["潮汐 Tide", "Tide"],
  [
    '<SelectItem value="serif">衬线 Serif</SelectItem>',
    '<SelectItem value="serif">Serif</SelectItem>',
  ],
  [
    '<div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink 列表 */}</div>',
    '<div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink list */}</div>',
  ],
  [
    '<FallingText text="弹 跳 弹 跳" gravity={0.8} bounce={0.9} />',
    '<FallingText text="Bounce · Jump · Bounce · Jump" gravity={0.8} bounce={0.9} />',
  ],
  ["bouncy 弹 跳 弹 跳 弹 跳", "bouncy bounce jump"],
  [
    "四种语义态：online 在线 / degraded 降级 / offline 离线 / maintenance 维护，颜色随 tone 自动派生。",
    "Four semantic states: online, degraded, offline, and maintenance. Colors are derived from tone.",
  ],
  [
    "loading 在正文位置渲染 TypingDots（agent 生成中），children 作占位被忽略。",
    "While the agent is responding, loading renders TypingDots in the message body and ignores placeholder children.",
  ],
  [
    "用 pnpm patch 固化补丁，随 lockfile 走。",
    "Use pnpm patch to persist the patch alongside the lockfile.",
  ],
  ["用 pnpm patch 固化补丁。", "Persist the fix with pnpm patch."],
  ["坑", "Pit"],
  ["正解", "Correct answer"],
  ["降级", "Degraded"],
  ["我", "Me"],
  ["琏", "Lian"],
  ["刚刚", "Just now"],
  ["瑚琏支持暗色吗？", "Does Hulian support dark mode?"],
  ["怎么切换？", "How do I switch themes?"],
  [
    "好的，我先看下现有结构再动手。",
    "Okay, let me take a look at the existing structure before starting.",
  ],
  ["退款预计 1-3 个工作日到账。", "Refunds are expected to arrive in 1-3 working days."],
  [
    '<Callout tone="warning" title="坑">直接改 node_modules 里的样式，下次安装会丢。</Callout>',
    '<Callout tone="warning" title="Pit">If you directly change the style in node_modules, it will be lost in the next installation.</Callout>',
  ],
  [
    '<Callout tone="success" title="正解">用 pnpm patch 固化补丁，随 lockfile 走。</Callout>',
    '<Callout tone="success" title="Correct answer">Use pnpm patch to persist the patch alongside the lockfile.</Callout>',
  ],
  [
    '<StatusDot status="degraded" label="降级" />',
    '<StatusDot status="degraded" label="Degraded" />',
  ],
  [
    '<StatusDot status="online" label="自动脉冲" />',
    '<StatusDot status="online" label="Automatic pulse" />',
  ],
  [
    '<StatusDot status="degraded" label="强制脉冲" pulse />',
    '<StatusDot status="degraded" label="Forced pulse" pulse />',
  ],
  [
    '<StatusDot status="online" label="关闭脉冲" pulse={false} />',
    '<StatusDot status="online" label="Turn off pulse" pulse={false} />',
  ],
  [
    '<ChatMessage role="assistant" name="瑚琏 AI">好的，我先看下现有结构再动手。</ChatMessage>',
    '<ChatMessage role="assistant" name="Hulian AI">Okay, let me take a look at the existing structure before starting.</ChatMessage>',
  ],
  [
    '<ChatMessage role="user" name="我">帮我把首页重写成 100% dogfood</ChatMessage>',
    '<ChatMessage role="user" name="Me">Help me rewrite the homepage to 100% dogfood</ChatMessage>',
  ],
  [
    '<ChatMessage role="user" name="我">瑚琏支持暗色吗？</ChatMessage>',
    '<ChatMessage role="user" name="Me">Does Hulian support dark mode?</ChatMessage>',
  ],
  [
    '<ChatMessage role="user" name="我">怎么切换？</ChatMessage>',
    '<ChatMessage role="user" name="Me">How do I switch themes?</ChatMessage>',
  ],
  [
    '<ChatMessage role="user" name="我">这条很长……</ChatMessage>',
    '<ChatMessage role="user" name="Me">This is a long message...</ChatMessage>',
  ],
  [
    '<ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="read">退款预计 1-3 个工作日到账。</ChatMessage>',
    '<ChatMessage role="user" name="Agent·Xiao Lian" timestamp="Just now" status="read">Refunds are expected to arrive in 1-3 working days.</ChatMessage>',
  ],
  ['avatar={<Avatar fallback="琏" />}', 'avatar={<Avatar fallback="Lian" />}'],
  ["avatar={<Avatar>瑚</Avatar>}", "avatar={<Avatar>Hu</Avatar>}"],
  [
    '<Chip tone="brand" avatar={<Avatar fallback="安" />}>安娜</Chip>',
    '<Chip tone="brand" avatar={<Avatar fallback="Ann" />}>Anna</Chip>',
  ],
  [
    "dot 状态点 / startContent 图标 / avatar 头像三选一（优先级 avatar > startContent > dot）。",
    "Choose one visual indicator: a dot, a startContent icon, or an avatar (priority: avatar > startContent > dot).",
  ],
  [
    "Statistic.Countdown 按 deadline 实时倒数，format 控制模板（支持 D/H/m/s/S）。",
    "Statistic.Countdown counts down to the deadline in real time; format controls the display template (supports D/H/m/s/S).",
  ],
  [
    "提高 velocity 加速漂移，className 透传到文本上色为主色。",
    "Increase velocity to speed up the drift; className sets the text to the primary color.",
  ],
  [
    "disabled 透传 Field.Root，控件随之禁用。",
    "disabled is passed to Field.Root, which disables the control.",
  ],
  [
    "icon 透传任意图标（如 ❤️），空状态复用同形状。",
    "icon accepts any icon, such as ❤️, and the empty state reuses the same shape.",
  ],
  [
    "size 透传内部 Spinner，控制指示器大小。",
    "size is passed to the internal Spinner and controls the indicator size.",
  ],
  [
    'size="sm" 透传给内部 Prose，整体排版基准降到 text-sm。',
    'size="sm" is passed to the internal Prose, reducing the typography baseline to text-sm.',
  ],
  [
    "kind 决定面额区主视觉：amount 满减 / discount 折扣 / shipping 包邮。",
    "kind defines the offer: amount for money off, discount for a percentage discount, and shipping for free delivery.",
  ],
  [
    "streakCount 加束 + 自定义暖色 colors，density 调密。",
    "streakCount adds more beams, colors sets a custom warm palette, and density controls spacing.",
  ],
  [
    "子元素沿圆周匀速环绕，中心放置标识/Logo。",
    "Child elements orbit at a constant speed, with a mark or logo in the center.",
  ],
  ["dot · 圆点+文字（building 脉冲）", "dot · Marker and label (building pulse)"],
  [
    "lineStyle 切换实/虚/点线，scanDirection 控制扫描带运动方向。",
    "lineStyle switches among solid, dashed, and dotted lines; scanDirection controls the scan direction.",
  ],
  ["theme light 主题 浅色 亮", "theme light bright"],
  ["瑚琏 · HULIAN ·", "HULIAN ·"],
  ["瑚琏 · HULIAN UI · 设计系统 ·", "HULIAN UI · Design system ·"],
  [
    '<CircularText text="瑚琏 · HULIAN UI · " spinDuration={',
    '<CircularText text="HULIAN UI · " spinDuration={',
  ],
  [
    '<CurvedLoop text="瑚琏 · HULIAN · " className="text-white" />',
    '<CurvedLoop text="HULIAN · " className="text-white" />',
  ],
  ['text="瑚琏 · HULIAN UI · 设计系统 · "', 'text="HULIAN UI · Design System · "'],
  [
    'yLabels={["一", "二", "三", "四", "五", "六", "日"]}',
    'yLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}',
  ],
  [
    '<Comment type="log" author="系统" content="将工单状态改为「处理中」" datetime="14:25" />',
    '<Comment type="log" author="System" content="Set the ticket status to Processing" datetime="14:25" />',
  ],
  ["瑚琏 Hulian", "Hulian"],
  ["主题", "Theme"],
  ["操作", "Actions"],
  ["数量", "Quantity"],
  ["收藏", "Favorite"],
  ["可关闭", "Dismissible"],
  ["斜体", "Italic"],
  ["网格密度", "Grid density"],
  ["操作成功", "Action completed"],
  ["吸取式聚合", "Composable building blocks"],
  ["统一为一套瑚琏 API", "Unified behind a single Hulian API"],
  [
    "卡片不指定 bgColor / textColor 时吃瑚琏 token，自动随明暗主题。",
    "Without bgColor or textColor, the card uses Hulian tokens and adapts to the active theme.",
  ],
  [
    "默认吃瑚琏 chart token 渐变，自动适配明暗主题。",
    "Uses the Hulian chart-token gradient by default and adapts to the active theme.",
  ],
  ["企业级 · 高质量 · 原生适配", "Enterprise-grade · High quality · Native-ready"],
  ["default（深色底·默认参数）", "default (dark background · default settings)"],
  [
    "支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。",
    "Yes. Light and dark themes render without a flash because SSR injects variables before first paint.",
  ],
]);

// These are code-bearing fragments whose spelling is part of the public API. The
// visible Chinese around them is still translated. Keeping protection here (and
// testing it separately) avoids silently changing props, URLs or placeholders.
const PROTECTED_TOKEN = new RegExp(
  [
    String.raw`https?:\/\/[^\s"'<>()[\]，。！？；：、（）【】]+`,
    String.raw`mailto:[^\s"'<>]+`,
    String.raw`\$\{[^{}]+\}`,
    String.raw`\{\{[^{}]+\}\}`,
    String.raw`\\(?:[A-Za-z]+|[0'"\\])`,
    String.raw`%[sdif]`,
    String.raw`#[0-9A-Fa-f]{3,8}(?![0-9A-Fa-f])`,
    String.raw`\d+(?:\.\d+)?(?:px|rem|em|ms|s|MB|GB|K|k|M|%)(?![A-Za-z0-9_])`,
    String.raw`\d+-?[A-Za-z][A-Za-z0-9_-]*(?![A-Za-z0-9_])`,
    String.raw`[A-Za-z][A-Za-z0-9_-]*-\*`,
    String.raw`[A-Za-z][A-Za-z0-9_-]*-\[[^\]\s]+\]`,
    String.raw`@[a-zA-Z0-9_.~/-]+`,
    String.raw`--[a-zA-Z0-9_-]+`,
    String.raw`[A-Za-z_$][A-Za-z0-9_$]*(?:[./:#-][A-Za-z0-9_$@~-]+)*`,
  ].join("|"),
  "gu",
);

export function showcaseAstValues(sourceRoot = DEFAULT_SHOWCASE_ROOT) {
  const values = new Set();
  const files = readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".showcase.tsx"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const root = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (
        (ts.isStringLiteral(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node) ||
          ts.isJsxText(node)) &&
        CJK.test(node.text)
      ) {
        for (const line of node.text.split(/\r?\n/u)) {
          if (!CJK.test(line)) continue;
          const key = line.trim().replace(/\s+/gu, " ");
          if (key) values.add(key);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(root);
  }
  return values;
}

export function inventoryValues(inventory, astValues = showcaseAstValues()) {
  const values = new Set();
  for (const kind of ["structured", "reactSource", "supportingSource"]) {
    const findings = inventory.findings?.[kind];
    if (!Array.isArray(findings)) continue;
    for (const finding of findings) {
      if (typeof finding?.value === "string" && CJK.test(finding.value)) values.add(finding.value);
    }
  }
  for (const value of astValues)
    if (typeof value === "string" && value.length > 0) values.add(value);
  return [...values].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function protectedTokens(value) {
  return [...value.matchAll(PROTECTED_TOKEN)]
    .map((match) => match[0])
    .filter((token) => !CJK.test(token));
}

export function protect(value) {
  const tokens = [];
  const text = value.replace(PROTECTED_TOKEN, (token) => {
    const id = `ZXQPH${String(tokens.length).padStart(4, "0")}QXZ`;
    tokens.push(token);
    return id;
  });
  return { text, tokens };
}

export function restore(value, tokens) {
  let restored = value;
  for (const [index, token] of tokens.entries()) {
    const marker = `ZXQPH${String(index).padStart(4, "0")}QXZ`;
    const occurrences = restored.split(marker).length - 1;
    if (occurrences !== 1) {
      throw new Error(`protected marker ${marker} occurred ${occurrences} times`);
    }
    restored = restored.replace(marker, token);
  }
  if (/ZXQPH\d{4}QXZ/u.test(restored)) throw new Error("translation returned an unknown marker");
  return restored;
}

function protectStable(value) {
  const markers = new Map();
  const text = value.replace(PROTECTED_TOKEN, (token) => {
    if (CJK.test(token)) return token;
    const marker = `ZXQS${Buffer.from(token).toString("base64url")}QXZ`;
    markers.set(marker, token);
    return marker;
  });
  return { text, markers };
}

function restoreStable(value, markers) {
  let restored = value;
  for (const [marker, token] of markers) {
    if (!restored.includes(marker)) {
      restored = `${restored} ${token}`;
      continue;
    }
    restored = restored.replaceAll(marker, token);
  }
  return restored;
}

function normalizeEnglish(value) {
  return value
    .replace(/Hu\s*Lian/giu, "Hulian")
    .replace(/Hulien/giu, "Hulian")
    .replace(/\bHulian\s+Hulian\b/giu, (text) =>
      text === text.toUpperCase() ? "HULIAN" : "Hulian",
    )
    .replace(/Hulian UI component library/giu, "Hulian component library")
    .replace(/(?:Absorption|Absorbent) polymerization design system/giu, "Composable design system")
    .replace(/Absorption polymerization/giu, "Composable building blocks")
    .replace(/documentation station/giu, "documentation site")
    .replace(/FujianICPPrepared(?=\d)/gu, "Fujian ICP No. ")
    .replace(/FujianICP\s+No/gu, "Fujian ICP No")
    .replace(/[“”]/gu, '"')
    .replace(/[‘’]/gu, "'")
    .replace(/，/gu, ", ")
    .replace(/。/gu, ".")
    .replace(/！/gu, "!")
    .replace(/？/gu, "?")
    .replace(/；/gu, "; ")
    .replace(/：/gu, ": ")
    .replace(/、/gu, ", ")
    .replace(/[（]/gu, "(")
    .replace(/[）]/gu, ")")
    .replace(/[【]/gu, "[")
    .replace(/[】]/gu, "]")
    .replace(/[《〈「『]/gu, '"')
    .replace(/[》〉」』]/gu, '"')
    .replace(/…/gu, "...")
    .replace(/\u3000/gu, " ")
    .replace(/￥/gu, "¥")
    .replace(/ {2,}/gu, " ")
    .replace(/[ \t]+\n/gu, "\n")
    .trim();
}

export function isHumanOnlyShowcaseText(source) {
  // A bare comparison/priority arrow (`>`) is ordinary prose. Opening markup,
  // JSX expressions, quoted attributes, and statement punctuation identify
  // executable fragments whose repeated tokens must remain byte-for-byte.
  return !/[<{}\[\]="'`;]/u.test(source);
}

function normalizeSourceEnglish(source, value) {
  let english = normalizeEnglish(value);
  if (isHumanOnlyShowcaseText(source)) {
    english = english.replace(/\b([A-Za-z][A-Za-z-]*)\s+\1\b/giu, "$1");
  }
  if (source.includes("YYYY 年 M 月 D 日")) {
    english = english.replace(/YYYY\s+year\s+M\s+month\s+D\s+day/giu, "MMM D, YYYY");
  }
  if (source.includes("M 月 D 日 HH:mm")) {
    english = english.replace(/M\s+Month\s+D\s+Day\s+HH:mm/giu, "MMM D, HH:mm");
  }
  if (source.includes("D 天 HH:mm:ss")) {
    english = english.replace(/D\s+days?\s+HH:mm:ss/giu, "D · HH:mm:ss");
  }
  english = english.replace(/\bTide\s+Tide\b/gu, "Tide");
  if (source.includes("瑚琏")) {
    english = english
      .replace(/Hu\s+(?:Li|Jue)/giu, "Hulian")
      .replace(/\b(?:Hulu|Huli|corals?)\b/giu, "Hulian")
      .replace(/HULIAN\s*·\s*HULIAN UI/gu, "HULIAN UI")
      .replace(/HULIAN\s*·\s*HULIAN/gu, "HULIAN");
  }
  return english;
}

function preserveOuterWhitespace(source, english) {
  const leading = source.match(/^\s*/u)?.[0] ?? "";
  const trailing = source.match(/\s*$/u)?.[0] ?? "";
  return `${leading}${english.trim()}${trailing}`;
}

function restoreTokenSpellings(source, english) {
  let restored = english;
  for (const [token, expected] of new Map(
    protectedTokens(source).map((token) => [
      token,
      protectedTokens(source).filter((candidate) => candidate === token).length,
    ]),
  )) {
    const exactCount = restored.split(token).length - 1;
    if (exactCount >= expected) continue;
    if (token.length === 1) {
      restored = `${restored} ${Array.from({ length: expected - exactCount }, () => token).join(
        " ",
      )}`;
      continue;
    }
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const prefix = /^[A-Za-z0-9_$]/u.test(token) ? "(?<![A-Za-z0-9_$])" : "";
    const suffix = /[A-Za-z0-9_$]$/u.test(token) ? "(?![A-Za-z0-9_$])" : "";
    const candidate = new RegExp(`${prefix}${escaped}${suffix}`, "giu");
    if (candidate.test(restored)) restored = restored.replace(candidate, token);
    const missing = expected - (restored.split(token).length - 1);
    if (missing > 0)
      restored = `${restored} ${Array.from({ length: missing }, () => token).join(" ")}`;
  }
  return restored;
}

function batches(entries, maxCharacters = 2_800) {
  const result = [];
  let current = [];
  let length = 0;
  for (const entry of entries) {
    const lineLength = entry.text.length + 20;
    if (current.length > 0 && length + lineLength > maxCharacters) {
      result.push(current);
      current = [];
      length = 0;
    }
    current.push(entry);
    length += lineLength;
  }
  if (current.length > 0) result.push(current);
  return result;
}

function translatedText(payload) {
  if (!Array.isArray(payload?.[0])) throw new Error("unexpected translation response");
  return payload[0].map((part) => part?.[0] ?? "").join("");
}

export function parseBatchTranslation(text, entries) {
  const matches = [...text.matchAll(MARKER)];
  const translated = new Map();
  for (const [index, match] of matches.entries()) {
    const id = Number(match[1]);
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    if (translated.has(id)) throw new Error(`duplicate translation marker HL${match[1]}`);
    translated.set(id, text.slice(start, end).trim());
  }
  const expected = new Set(entries.map((entry) => entry.id));
  if (translated.size !== expected.size || [...translated.keys()].some((id) => !expected.has(id))) {
    throw new Error(
      `translation marker mismatch: expected ${expected.size}, received ${translated.size}`,
    );
  }
  return translated;
}

async function fetchWithRetry(batch, rawCache, persistRawCache, attempt = 1) {
  const query = batch
    .map((entry) => `⟦HL${String(entry.id).padStart(6, "0")}⟧ ${entry.text}`)
    .join("\n");
  const cacheKey = createHash("sha256").update(query).digest("hex");
  if (typeof rawCache[cacheKey] === "string") {
    return parseBatchTranslation(rawCache[cacheKey], batch);
  }
  const params = new URLSearchParams({ client: "gtx", sl: "zh-CN", tl: "en", dt: "t", q: query });
  try {
    const response = await fetch(`${TRANSLATE_ENDPOINT}?${params}`, {
      headers: { "user-agent": "Hulian-docs-offline-translation-builder/1.0" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = translatedText(await response.json());
    const parsed = parseBatchTranslation(text, batch);
    rawCache[cacheKey] = text;
    persistRawCache?.(rawCache);
    return parsed;
  } catch (error) {
    if (attempt >= 5) throw error;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500 * 2 ** (attempt - 1)));
    return fetchWithRetry(batch, rawCache, persistRawCache, attempt + 1);
  }
}

async function concurrentMap(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

export async function generateTranslations({
  inventory,
  existing = {},
  cache = {},
  rawCache = {},
  persistRawCache,
  onProgress,
}) {
  const sources = inventoryValues(inventory);
  const existingExact = existing.exact ?? existing;
  const cacheExact = cache.exact ?? cache;
  const result = {};
  const pending = [];
  for (const [id, source] of sources.entries()) {
    if (MANUAL_COPY.has(source)) {
      result[source] = MANUAL_COPY.get(source);
      continue;
    }
    const retained = existingExact[source] ?? cacheExact[source];
    if (typeof retained === "string" && retained.trim().length > 0 && !CJK.test(retained)) {
      result[source] = restoreTokenSpellings(source, normalizeSourceEnglish(source, retained));
      continue;
    }
    const secured = protect(source);
    pending.push({ id, source, ...secured });
  }

  async function translatePending(entries, phase) {
    const chunks = batches(entries);
    let completed = 0;
    const translations = await concurrentMap(chunks, 3, async (chunk) => {
      const translated = await fetchWithRetry(chunk, rawCache, persistRawCache);
      completed += 1;
      onProgress?.({ completed, total: chunks.length, strings: chunk.length, phase });
      return translated;
    });
    return new Map(translations.flatMap((translation) => [...translation]));
  }

  const byId = await translatePending(pending, "initial");
  const working = new Map();
  const markerFallback = [];
  for (const entry of pending) {
    const raw = byId.get(entry.id);
    if (raw === undefined)
      throw new Error(`missing translated value for ${JSON.stringify(entry.source)}`);
    if (raw.trim() === "") {
      markerFallback.push({
        id: entry.id,
        source: entry.source,
        text: entry.source.replace(/^(\s*)的/u, "$1"),
        tokens: [],
        stable: false,
      });
      continue;
    }
    try {
      working.set(entry.id, normalizeEnglish(restore(raw, entry.tokens)));
    } catch (error) {
      markerFallback.push({
        id: entry.id,
        source: entry.source,
        ...protectStable(entry.source),
        stable: true,
      });
    }
  }
  if (markerFallback.length > 0) {
    const translated = await translatePending(markerFallback, "marker-fallback");
    for (const entry of markerFallback) {
      const raw = translated.get(entry.id);
      working.set(
        entry.id,
        normalizeEnglish(entry.stable ? restoreStable(raw, entry.markers) : raw),
      );
    }
  }

  // The endpoint occasionally stops translating immediately after protected Markdown or
  // JSX. Translate only that residue again while protecting the English already produced.
  for (let pass = 1; pass <= 3; pass += 1) {
    const residue = pending
      .filter((entry) => CJK.test(working.get(entry.id) ?? ""))
      .map((entry) => ({
        id: entry.id,
        source: entry.source,
        text: working.get(entry.id),
        tokens: [],
      }));
    if (residue.length === 0) break;
    const translated = await translatePending(residue, `residue-${pass}`);
    for (const entry of residue) {
      working.set(entry.id, normalizeEnglish(translated.get(entry.id)));
    }
  }

  const fragments = [
    ...new Set(
      [...working.values()].flatMap((value) =>
        [...value.matchAll(/[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]+/gu)]
          .map((match) => match[0])
          .filter((fragment) => /\p{Script=Han}/u.test(fragment)),
      ),
    ),
  ].sort((a, b) => b.length - a.length);
  if (fragments.length > 0) {
    const entries = fragments.map((fragment, id) => ({ id, source: fragment, text: fragment }));
    const translated = await concurrentMap(entries, 3, async (entry, index) => {
      onProgress?.({
        completed: index + 1,
        total: entries.length,
        strings: 1,
        phase: "fragment-fallback",
      });
      return fetchWithRetry([entry], rawCache, persistRawCache);
    });
    const fragmentCopy = new Map(
      entries.map((entry, index) => [
        entry.source,
        normalizeEnglish(translated[index].get(entry.id)),
      ]),
    );
    for (const [id, value] of working) {
      let english = value;
      for (const [source, target] of fragmentCopy) english = english.replaceAll(source, target);
      working.set(id, normalizeEnglish(english));
    }
  }

  for (const entry of pending) {
    let english = preserveOuterWhitespace(
      entry.source,
      restoreTokenSpellings(
        entry.source,
        normalizeSourceEnglish(entry.source, working.get(entry.id)),
      ),
    );
    if ((!english || CJK.test(english)) && !/\p{Script=Han}/u.test(entry.source)) {
      english = preserveOuterWhitespace(entry.source, normalizeEnglish(entry.source));
    }
    if (!english.trim() || CJK.test(english)) {
      throw new Error(
        `invalid English for ${JSON.stringify(entry.source)}: ${JSON.stringify(english)}`,
      );
    }
    for (const token of protectedTokens(entry.source)) {
      if (!english.includes(token)) {
        throw new Error(
          `English lost protected token ${JSON.stringify(token)} for ${JSON.stringify(
            entry.source,
          )}: ${JSON.stringify(english)}`,
        );
      }
    }
    result[entry.source] = english;
  }
  return { exact: Object.fromEntries(sources.map((source) => [source, result[source]])) };
}

function readJsonIfPresent(file, fallback = {}) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function main() {
  const inventoryFile = resolve(process.argv[2] ?? DEFAULT_INVENTORY);
  const outputFile = resolve(process.argv[3] ?? DEFAULT_OUTPUT);
  const cacheFile = resolve(process.env.HULIAN_TRANSLATION_CACHE ?? DEFAULT_CACHE);
  const rawCacheFile = resolve(process.env.HULIAN_TRANSLATION_RAW_CACHE ?? DEFAULT_RAW_CACHE);
  const inventory = readJsonIfPresent(inventoryFile);
  const refresh = process.env.HULIAN_TRANSLATION_REFRESH === "1";
  const existing = refresh ? {} : readJsonIfPresent(outputFile);
  const cache = refresh ? {} : readJsonIfPresent(cacheFile);
  const rawCache = readJsonIfPresent(rawCacheFile);
  const copy = await generateTranslations({
    inventory,
    existing,
    cache,
    rawCache,
    persistRawCache: (next) => writeFileSync(rawCacheFile, `${JSON.stringify(next)}\n`),
    onProgress: ({ completed, total, phase }) =>
      console.log(`[showcase-copy] ${phase} batch ${completed}/${total}`),
  });
  const serialized = `${JSON.stringify(copy, null, 2)}\n`;
  writeFileSync(outputFile, serialized);
  writeFileSync(cacheFile, serialized);
  console.log(
    `[showcase-copy] wrote ${Object.keys(copy.exact).length} static translations to ${outputFile}`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) await main();
