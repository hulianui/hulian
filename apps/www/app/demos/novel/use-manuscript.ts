"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { NovelChapter } from "@hulianui/ui";

const STORAGE_KEY = "hulian-demo-novel-manuscript";

function isChapterList(value: unknown): value is NovelChapter[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as NovelChapter).id === "string" &&
        typeof (item as NovelChapter).title === "string" &&
        typeof (item as NovelChapter).content === "string",
    )
  );
}

/** 阅读和写作共用同一份文稿。首屏先用种子，避免刷新时正文空白。 */
export function useManuscript(seed: NovelChapter[]) {
  const [chapters, setChapters] = useState(seed);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isChapterList(parsed) && parsed.length > 0) setChapters(parsed);
      }
    } catch {
      // 本地稿坏了就继续用种子，不打断阅读。
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
  }, [hydrated, chapters]);

  return [chapters, setChapters] as const;
}
