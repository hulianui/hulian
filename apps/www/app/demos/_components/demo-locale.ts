import { DOCS_LOCALE } from "../../../lib/docs-locale";

/** Components with a dedicated locale prop use a shorter locale code than ConfigProvider. */
export const DEMO_RELATIVE_TIME_LOCALE = DOCS_LOCALE === "en" ? "en" : "zh";
