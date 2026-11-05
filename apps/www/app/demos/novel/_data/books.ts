import type { NovelChapter } from "@hulianui/ui";
import { copy } from "./books.content";

export interface NovelDemoBook {
  id: string;
  title: string;
  /** 英文书名。封面上作装帧元素排，与中文标题同一块。 */
  titleEn: string;
  author: string;
  /** 一段话简介，详情页正文区用。 */
  blurb: string;
  /** 一句话钩子，书架卡片、搜索结果用。 */
  tagline: string;
  /** 从正文里挑的原句，详情页当引文排。 */
  excerpt: string;
  /** 分类：夜航 / 书信 / 日常。书库筛选按它分。 */
  genre: string;
  year: string;
  /**
   * 封面渐变起止色。书架和详情页共用这一组，换书只换这里；
   * 用 hex 而不是 token —— 书封是作品自己的颜色，不该跟着主题变。
   */
  cover: { from: string; to: string };
  chapters: NovelChapter[];
}

/** 去掉空白后的字符数。中文的字数就是字符数，不是分词数。 */
export function countWords(text: string): number {
  return text.replace(/\s+/gu, "").length;
}

export function chapterWordCount(chapter: NovelChapter): number {
  return chapter.wordCount ?? countWords(chapter.content);
}

export function bookWordCount(book: NovelDemoBook): number {
  return book.chapters.reduce((total, chapter) => total + chapterWordCount(chapter), 0);
}

export function novelBooks(): NovelDemoBook[] {
  return [
    {
      id: "ferry",
      title: copy("ferryTitle"),
      titleEn: "The Ferry Light",
      author: copy("ferryAuthor"),
      blurb: copy("ferryBlurb"),
      tagline: copy("ferryTagline"),
      excerpt: copy("ferryExcerpt"),
      genre: copy("ferryGenre"),
      year: "2024",
      cover: { from: "#1b2a44", to: "#3d5f86" },
      chapters: [
        { id: "c1", title: copy("ferryC1Title"), content: copy("ferryC1Body") },
        { id: "c2", title: copy("ferryC2Title"), content: copy("ferryC2Body") },
        { id: "c3", title: copy("ferryC3Title"), content: copy("ferryC3Body") },
      ],
    },
    {
      id: "well",
      title: copy("wellTitle"),
      titleEn: "The Well Letter",
      author: copy("wellAuthor"),
      blurb: copy("wellBlurb"),
      tagline: copy("wellTagline"),
      excerpt: copy("wellExcerpt"),
      genre: copy("wellGenre"),
      year: "2023",
      cover: { from: "#7a5a3a", to: "#b08a5e" },
      chapters: [
        { id: "c1", title: copy("wellC1Title"), content: copy("wellC1Body") },
        { id: "c2", title: copy("wellC2Title"), content: copy("wellC2Body") },
      ],
    },
    {
      id: "south",
      title: copy("southTitle"),
      titleEn: "The South Window",
      author: copy("southAuthor"),
      blurb: copy("southBlurb"),
      tagline: copy("southTagline"),
      excerpt: copy("southExcerpt"),
      genre: copy("southGenre"),
      year: "2025",
      cover: { from: "#3c4a3a", to: "#6f8461" },
      chapters: [
        { id: "c1", title: copy("southC1Title"), content: copy("southC1Body") },
        { id: "c2", title: copy("southC2Title"), content: copy("southC2Body") },
      ],
    },
  ];
}
