type TranslationContent = Record<string, unknown>;

export function t<TContent extends TranslationContent>(content: TContent) {
  return {
    nodeType: "translation" as const,
    translation: content,
  };
}
