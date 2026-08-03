import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    choreographyCanvas: "编排画布",
    templateLibrary: "模板库",
    productGallery: "产物画廊",
  },
  en: {
    choreographyCanvas: "Workflow canvas",
    templateLibrary: "Template library",
    productGallery: "Artifact gallery",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-ai-workflow-components-nav-config",
  content: t(content),
};

export default dictionary;
