import { Book3D } from "@hulianui/ui";
import type { NovelDemoBook } from "../_data/books";

/**
 * 书封。作品自己的两色由数据给（不跟主题走），标题走中文竖排感的衬线，
 * 下面缀一行常被中文出版物用作装帧元素的英文书名。
 */
export function BookCover({
  book,
  className,
  thickness = "1.25rem",
  href,
  compact = false,
}: {
  book: NovelDemoBook;
  className?: string;
  thickness?: string;
  href?: string;
  /**
   * 小尺寸封面（书架、表格行）。Book3D 的标题是固定 1.6rem 的左对齐大字，
   * 封面窄到 160px 时四字书名会被左缘的装订带和 25° 静止倾角吃掉半个字 ——
   * 小封面上换成更小一档的字号，并把标题整体右移，避开装订带。
   */
  compact?: boolean;
}) {
  return (
    <Book3D
      title={
        <span
          className={
            compact
              ? "novel-serif block pl-5 text-[1.3rem] font-normal leading-snug tracking-normal"
              : "novel-serif block pl-4 text-[1.85rem] font-normal leading-tight tracking-normal"
          }
        >
          {book.title}
          <span
            className={
              compact
                ? "mt-2 block text-[9px] font-normal normal-case tracking-[0.14em] text-white/70"
                : "mt-2 block text-[11px] font-normal normal-case tracking-[0.16em] text-white/70"
            }
          >
            {book.titleEn}
          </span>
        </span>
      }
      subtitle={book.author}
      coverColor={book.cover}
      thickness={thickness}
      className={className}
      href={href}
    />
  );
}
