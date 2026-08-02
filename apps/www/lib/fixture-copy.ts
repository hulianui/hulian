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

  if (CJK.test(translated)) {
    throw new Error(`Missing committed English fixture copy for ${JSON.stringify(value)}`);
  }
  return translated;
}

function isReactElement(value: unknown): value is { $$typeof: symbol } {
  return Boolean(value && typeof value === "object" && "$$typeof" in value);
}

export function translateFixtureValue(value: unknown): unknown {
  if (DOCS_LOCALE !== "en") return value;
  if (typeof value === "string") return translateFixtureText(value);
  if (Array.isArray(value)) return value.map(translateFixtureValue);
  if (!value || typeof value !== "object" || isReactElement(value)) return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      key === "style" || key === "dangerouslySetInnerHTML" ? entry : translateFixtureValue(entry),
    ]),
  );
}

export function fixtureChineseBranch(english: FixtureCopy): FixtureCopy {
  return Object.fromEntries(Object.keys(english).map((source) => [source, source]));
}

export { blockEnglish, pageEnglish };
