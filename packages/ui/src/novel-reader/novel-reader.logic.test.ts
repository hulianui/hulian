import { describe, expect, it } from "vitest";
import {
  actionFromKey,
  bookProgressPercent,
  chapterProgressPercent,
  clampOffset,
  directionFromSwipe,
  directionFromTap,
  directionFromWheel,
  offsetForPage,
  pageCountFor,
  pageForOffset,
  paperPresentation,
  parseNovelProgress,
  resolveNovelTurn,
} from "./novel-reader.logic";

describe("小说阅读进度", () => {
  it("拒绝页码式脏数据，只收章节和字符偏移", () => {
    expect(parseNovelProgress(null)).toBeNull();
    expect(parseNovelProgress("{")).toBeNull();
    expect(parseNovelProgress(JSON.stringify({ page: 3 }))).toBeNull();
    expect(parseNovelProgress(JSON.stringify({ chapterId: "c2", charOffset: 18 }))).toEqual({
      chapterId: "c2",
      charOffset: 18,
    });
  });

  it("改字号后仍按字符偏移回到同一位置，而不是旧页码", () => {
    const length = 400;
    const offset = 120;
    const narrow = pageForOffset(offset, length, pageCountFor(2000, 400));
    const wide = pageForOffset(offset, length, pageCountFor(1200, 400));
    expect(narrow).not.toBe(wide);
    expect(offsetForPage(narrow, length, pageCountFor(2000, 400))).toBeLessThanOrEqual(offset);
    expect(chapterProgressPercent(offset, length)).toBe(30);
  });

  it("章条和章内百分比分开算", () => {
    expect(bookProgressPercent(0, 4)).toBe(25);
    expect(bookProgressPercent(3, 4)).toBe(100);
    expect(chapterProgressPercent(0, 80)).toBe(0);
    expect(chapterProgressPercent(80, 80)).toBe(100);
    expect(clampOffset(-4, 10)).toBe(0);
  });
});

describe("翻页方向", () => {
  it("滚轮、滑动、点边和方向键都是向前或向后", () => {
    expect(directionFromWheel(0, 20)).toBe(1);
    expect(directionFromWheel(0, -20)).toBe(-1);
    expect(directionFromSwipe(-80, 10)).toBe(1);
    expect(directionFromSwipe(80, 4)).toBe(-1);
    expect(directionFromSwipe(0, -70)).toBe(1);
    expect(directionFromTap(0.1)).toBe(-1);
    expect(directionFromTap(0.9)).toBe(1);
    expect(directionFromTap(0.5)).toBe(0);
    expect(actionFromKey("ArrowDown", false)).toBe("forward");
    expect(actionFromKey("ArrowUp", false)).toBe("back");
    expect(actionFromKey("ArrowRight", true)).toBe("chapter-next");
    expect(actionFromKey("[", false)).toBe("chapter-prev");
    expect(actionFromKey("Escape", false)).toBe("dismiss");
  });

  it("mode=paginated 映射成覆盖翻页，turn 优先", () => {
    expect(resolveNovelTurn(undefined, "paginated")).toBe("cover");
    expect(resolveNovelTurn(undefined, "scroll")).toBe("scroll");
    expect(resolveNovelTurn("simulation", "paginated")).toBe("simulation");
  });

  it("夜间纸色走暗色 token，且比近黑更靠 surface", () => {
    expect(paperPresentation("night").className).toContain("bg-surface");
    expect(paperPresentation("night").className).toContain("text-muted-foreground");
    expect(paperPresentation("night").className).not.toContain("bg-black");
    expect(paperPresentation("night").theme).toBe("dark");
    expect(paperPresentation("oled").className).toContain("bg-bg");
    expect(paperPresentation("eye").className).toContain("bg-success/12");
    expect(paperPresentation("default").theme).toBeUndefined();
  });
});
