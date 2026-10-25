import type { HTMLAttributes } from "react";
import type { NovelChapter } from "../novel-reader/novel-reader.types";

export interface NovelEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 受控章节。与 `onChaptersChange` 一起用。 */
  chapters?: NovelChapter[];
  /** 非受控初始章节。 */
  defaultChapters?: NovelChapter[];
  onChaptersChange?: (chapters: NovelChapter[]) => void;
  /** 受控正在编辑的章。 */
  activeChapterId?: string;
  defaultActiveChapterId?: string;
  onActiveChapterChange?: (id: string) => void;
  /** 传入后显示保存按钮，参数为当前全部章节。 */
  onSave?: (chapters: NovelChapter[]) => void;
  disabled?: boolean;
}
