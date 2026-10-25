import type { NovelChapter } from "@hulianui/ui";
import { copy } from "./books.content";

export function ferryBook() {
  const chapters: NovelChapter[] = [
    { id: "c1", title: copy("c1Title"), content: copy("c1Body") },
    { id: "c2", title: copy("c2Title"), content: copy("c2Body") },
    { id: "c3", title: copy("c3Title"), content: copy("c3Body") },
  ];
  return {
    title: copy("title"),
    author: copy("author"),
    blurb: copy("blurb"),
    chapters,
  };
}
