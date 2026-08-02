import blockEnglish from "../app/blocks/block-fixtures.en.json";
import pageEnglish from "../app/pages/page-fixtures.en.json";
import { DOCS_LOCALE } from "./docs-locale";

type FixtureCopy = Record<string, string>;

const englishCopy: FixtureCopy = { ...blockEnglish, ...pageEnglish };
const englishEntries = Object.entries(englishCopy).sort(([a], [b]) => b.length - a.length);
const CJK = /[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]/u;

function normalized(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function translateFixtureText(value: string): string {
  if (DOCS_LOCALE !== "en" || !CJK.test(value)) return value;

  const exact = englishCopy[normalized(value)];
  if (exact) return exact;

  let translated = value;
  for (const [source, target] of englishEntries) {
    if (translated.includes(source)) translated = translated.replaceAll(source, target);
  }

  return CJK.test(translated) ? value : translated;
}

function isReactElement(value: unknown): value is { $$typeof: symbol } {
  return Boolean(value && typeof value === "object" && "$$typeof" in value);
}

const PRESENTATION_FIELDS = new Set([
  "aria-label",
  "ariaLabel",
  "alt",
  "authorInitial",
  "caption",
  "children",
  "closeLabel",
  "content",
  "deltaLabel",
  "description",
  "duration",
  "emptyText",
  "fallback",
  "header",
  "helperText",
  "hint",
  "initial",
  "kicker",
  "label",
  "message",
  "pending",
  "placeholder",
  "subTitle",
  "subtitle",
  "text",
  "thumbnailAlt",
  "title",
]);

const STRUCTURED_PRESENTATION_FIELDS = new Set([
  "avatars",
  "columns",
  "data",
  "fields",
  "grades",
  "items",
  "lines",
  "nodes",
  "options",
  "rows",
  "sections",
  "search",
  "series",
  "steps",
  "suggestions",
  "tabs",
]);

function translateTextNode(value: unknown): unknown {
  if (typeof value === "string") return translateFixtureText(value);
  if (Array.isArray(value)) return value.map(translateTextNode);
  return value;
}

function translateStructuredPresentation(value: unknown): unknown {
  if (typeof value === "string") return translateFixtureText(value);
  if (Array.isArray(value)) return value.map(translateStructuredPresentation);
  if (!value || typeof value !== "object" || isReactElement(value)) return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (PRESENTATION_FIELDS.has(key)) return [key, translateTextNode(entry)];
      if (STRUCTURED_PRESENTATION_FIELDS.has(key)) {
        return [key, translateStructuredPresentation(entry)];
      }
      return [key, entry];
    }),
  );
}

/**
 * Localizes fixture-owned presentation copy only. Controlled data (`value`, `defaultValue`),
 * identifiers (`id`, `name`), URLs/protocols, callbacks, and unknown props are passed through
 * byte-for-byte so user input can never be rewritten or rejected by the docs adapter.
 */
export function translateFixtureProps<T extends Record<string, unknown>>(props: T): T {
  if (DOCS_LOCALE !== "en") return props;
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => {
      if (PRESENTATION_FIELDS.has(key)) return [key, translateTextNode(value)];
      if (STRUCTURED_PRESENTATION_FIELDS.has(key)) {
        return [key, translateStructuredPresentation(value)];
      }
      return [key, value];
    }),
  ) as T;
}

export { blockEnglish, pageEnglish };
