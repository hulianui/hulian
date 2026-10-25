import type { NovelChapter } from "@hulianui/ui";
import { copy } from "./books.content";

export interface NovelDemoBook {
  id: string;
  title: string;
  author: string;
  blurb: string;
  chapters: NovelChapter[];
}

export function novelBooks(): NovelDemoBook[] {
  return [
    {
      id: "ferry",
      title: copy("ferryTitle"),
      author: copy("ferryAuthor"),
      blurb: copy("ferryBlurb"),
      chapters: [
        { id: "c1", title: copy("ferryC1Title"), content: copy("ferryC1Body") },
        { id: "c2", title: copy("ferryC2Title"), content: copy("ferryC2Body") },
        { id: "c3", title: copy("ferryC3Title"), content: copy("ferryC3Body") },
      ],
    },
    {
      id: "well",
      title: copy("wellTitle"),
      author: copy("wellAuthor"),
      blurb: copy("wellBlurb"),
      chapters: [
        { id: "c1", title: copy("wellC1Title"), content: copy("wellC1Body") },
        { id: "c2", title: copy("wellC2Title"), content: copy("wellC2Body") },
      ],
    },
    {
      id: "south",
      title: copy("southTitle"),
      author: copy("southAuthor"),
      blurb: copy("southBlurb"),
      chapters: [
        { id: "c1", title: copy("southC1Title"), content: copy("southC1Body") },
        { id: "c2", title: copy("southC2Title"), content: copy("southC2Body") },
      ],
    },
  ];
}
