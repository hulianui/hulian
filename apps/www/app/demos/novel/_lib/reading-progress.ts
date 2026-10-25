export function savedChapterId(bookId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`hulian.novel-reader:${bookId}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const chapterId = (parsed as { chapterId?: unknown }).chapterId;
    return typeof chapterId === "string" ? chapterId : null;
  } catch {
    return null;
  }
}
