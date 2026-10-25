import type { HTMLAttributes, ReactNode } from "react";

/** 一章。`content` 是 Markdown 源。 */
export interface NovelChapter {
  id: string;
  /** 章名，不含「第 N 章」前缀；目录和正文标题由组件编号。 */
  title: string;
  /** Markdown 正文。 */
  content: string;
  /** 展示用字数。缺省时按去掉空白后的字符数估算。 */
  wordCount?: number;
}

/**
 * 阅读进度。只记章节和字符偏移，不记页码。
 * 改字号、行距、栏宽后仍回到同一句附近。
 */
export interface NovelProgress {
  chapterId: string;
  /** 相对本章已渲染正文的字符偏移（从 0 起）。 */
  charOffset: number;
}

/** 翻页方式：滚动连读 / 覆盖翻页 / 仿真翻页。手势方向三者相同。 */
export type NovelTurn = "scroll" | "cover" | "simulation";

/** 旧称。`scroll` 等于连读，`paginated` 等于覆盖翻页。 */
export type NovelMode = "scroll" | "paginated";

/** 正文字号档，对应排版 token，不写死像素。 */
export type NovelFontSize = "sm" | "md" | "lg" | "xl";

/** 正文行距档。 */
export type NovelLineHeight = "snug" | "normal" | "relaxed" | "loose";

/** 正文栏宽。 */
export type NovelMeasure = "narrow" | "normal" | "wide";

/**
 * 正文纸色。和系统 Dark 分开：
 * 菜单跟页面 token，纸色只包住正文。
 * `night` 是偏柔的暗纸，`oled` 才接近纯黑。
 */
export type NovelPaper = "default" | "day" | "eye" | "night" | "oled";

export interface NovelReaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 书名。 */
  title?: string;
  /** 作者。 */
  author?: ReactNode;
  chapters: NovelChapter[];
  /** 受控当前章。 */
  chapterId?: string;
  /** 非受控初始章。本地进度优先于它。 */
  defaultChapterId?: string;
  onChapterChange?: (id: string) => void;
  /**
   * 翻页方式。滚动、覆盖、仿真共用一套「向前 / 向后」。
   * 滚动是默认：长文连读，到章末可以继续进入下一章。
   */
  turn?: NovelTurn;
  defaultTurn?: NovelTurn;
  onTurnChange?: (turn: NovelTurn) => void;
  /**
   * 旧入口。`paginated` 视为 `cover`，`scroll` 视为 `scroll`。
   * 与 `turn` 同时传时以 `turn` 为准。
   */
  mode?: NovelMode;
  fontSize?: NovelFontSize;
  defaultFontSize?: NovelFontSize;
  onFontSizeChange?: (size: NovelFontSize) => void;
  lineHeight?: NovelLineHeight;
  defaultLineHeight?: NovelLineHeight;
  onLineHeightChange?: (lineHeight: NovelLineHeight) => void;
  /** 正文栏宽。 */
  measure?: NovelMeasure;
  defaultMeasure?: NovelMeasure;
  onMeasureChange?: (measure: NovelMeasure) => void;
  paper?: NovelPaper;
  defaultPaper?: NovelPaper;
  onPaperChange?: (paper: NovelPaper) => void;
  /**
   * 传入后把 `{ chapterId, charOffset }` 写入 localStorage。
   * 刷新或重进时回到上次读到的句子附近，不依赖账号。
   */
  persistKey?: string;
  onProgressChange?: (progress: NovelProgress) => void;
  /**
   * 唤出菜单后放在顶栏左上角（返回、书架）。
   * 不要放正文正中，以免和翻页热区抢点击。
   */
  leading?: ReactNode;
  /** 唤出菜单后放在顶栏右侧（写作入口等）。 */
  trailing?: ReactNode;
}
