import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NovelReader } from "./novel-reader";
import { novelProgressStorageKey } from "./novel-reader.logic";

const chapters = [
  { id: "c1", title: "夜航", content: "河面暗下来。" },
  { id: "c2", title: "返程", content: "回程的船更轻。" },
];

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockBox() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 400,
    bottom: 800,
    width: 400,
    height: 800,
    toJSON() {
      return {};
    },
  });
}

describe("NovelReader", () => {
  it("默认没有整页顶底栏，章末下一章在正文流里", () => {
    render(<NovelReader chapters={chapters} />);
    expect(document.querySelector("[data-novel-chrome]")).toBeNull();
    expect(screen.queryByRole("button", { name: "目录" })).toBeNull();
    expect(screen.queryByRole("button", { name: "本章说" })).toBeNull();
    expect(document.querySelector("[data-novel-chapter-nav='start']")).toBeNull();
    expect(screen.getByRole("heading", { name: "第 1 章 夜航" })).toBeTruthy();
    expect(screen.getByText("河面暗下来。")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "本章" })).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
    const end = document.querySelector("[data-novel-chapter-nav='end']");
    const next = screen.getByRole("button", { name: "下一章" });
    expect(end?.contains(next)).toBe(true);
    expect(end?.textContent).toContain("本章完");
    fireEvent.click(next);
    const region = screen.getByRole("region", { name: "正文" });
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    expect(document.querySelector("[data-novel-chrome]")).toBeNull();
    expect(screen.queryByRole("button", { name: "目录" })).toBeNull();
  });

  it("有上一章时，上一章在章首而不是顶栏", () => {
    render(<NovelReader chapters={chapters} defaultChapterId="c2" />);
    expect(document.querySelector("[data-novel-chrome]")).toBeNull();
    const start = document.querySelector("[data-novel-chapter-nav='start']");
    const previous = screen.getByRole("button", { name: "上一章" });
    expect(start?.contains(previous)).toBe(true);
    expect(document.querySelector("[data-novel-chapter-nav='end'] button")).toBeNull();
    fireEvent.click(previous);
    const region = screen.getByRole("region", { name: "正文" });
    expect(region.getAttribute("data-novel-chapter")).toBe("c1");
    expect(document.querySelector("[data-novel-chapter-nav='end']")?.contains(screen.getByRole("button", { name: "下一章" }))).toBe(true);
  });

  it("点中间唤出菜单，点边缘不把菜单打开；目录跳章后焦点回到正文", () => {
    mockBox();
    render(<NovelReader chapters={chapters} />);
    const region = screen.getByRole("region", { name: "正文" });
    fireEvent.click(region, { clientX: 10, clientY: 200 });
    expect(screen.queryByRole("button", { name: "目录" })).toBeNull();
    fireEvent.click(region, { clientX: 200, clientY: 200 });
    const chrome = document.querySelector("[data-novel-chrome]");
    expect(chrome).toBeTruthy();
    expect(chrome?.querySelectorAll("button").length).toBeGreaterThan(0);
    const catalogs = screen.getAllByRole("button", { name: "目录" });
    expect(catalogs).toHaveLength(2);
    expect(document.querySelector("[data-novel-chapter-nav='end']")?.textContent).toContain("下一章");
    fireEvent.click(catalogs[0]);
    expect(screen.getByRole("dialog", { name: "目录" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "第 2 章 返程" }));
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    expect(region.getAttribute("data-novel-offset")).toBe("0");
    expect(document.activeElement).toBe(region);
  });

  it("按字符偏移恢复进度，改字号不改回第一章", () => {
    const key = novelProgressStorageKey("ferry");
    localStorage.setItem(key, JSON.stringify({ chapterId: "c2", charOffset: 4 }));
    const { rerender } = render(<NovelReader chapters={chapters} persistKey="ferry" />);
    const region = screen.getByRole("region", { name: "正文" });
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    expect(region.getAttribute("data-novel-offset")).toBe("4");
    rerender(<NovelReader chapters={chapters} persistKey="ferry" fontSize="xl" />);
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    expect(region.getAttribute("data-novel-offset")).toBe("4");
    expect(localStorage.getItem(key)).toContain('"charOffset":4');
    expect(localStorage.getItem(key)).not.toContain('"chapterId":"c1"');
  });

  it("方括号连续切章，焦点在章末按钮上也不失效", () => {
    render(<NovelReader chapters={chapters} />);
    const region = screen.getByRole("region", { name: "正文" });
    const next = screen.getByRole("button", { name: "下一章" });
    next.focus();
    fireEvent.keyDown(next, { key: "]" });
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    fireEvent.keyDown(region, { key: "[" });
    expect(region.getAttribute("data-novel-chapter")).toBe("c1");
    expect(region.getAttribute("data-novel-offset")).toBe("0");
  });

  it("窗口尺寸变化只重投影，不改字符偏移", () => {
    const key = novelProgressStorageKey("resize");
    localStorage.setItem(key, JSON.stringify({ chapterId: "c2", charOffset: 4 }));
    let notify: ResizeObserverCallback | null = null;
    class BoxObserver {
      constructor(callback: ResizeObserverCallback) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", BoxObserver);
    render(<NovelReader chapters={chapters} persistKey="resize" />);
    const region = screen.getByRole("region", { name: "正文" });
    const viewport = document.querySelector("[data-novel-viewport]") as HTMLElement;
    let top = 0;
    Object.defineProperty(viewport, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(viewport, "scrollHeight", { configurable: true, value: 400 });
    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      get: () => top,
      set: (value: number) => {
        top = value;
        viewport.dispatchEvent(new Event("scroll"));
      },
    });
    act(() => {
      notify?.([], {} as ResizeObserver);
    });
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    expect(region.getAttribute("data-novel-offset")).toBe("4");
    expect(top).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });

  it("滚轮和 Alt+方向键都按章前进或后退", () => {
    const { unmount } = render(<NovelReader chapters={chapters} />);
    const region = screen.getByRole("region", { name: "正文" });
    fireEvent.wheel(region, { deltaY: 120 });
    expect(region.getAttribute("data-novel-chapter")).toBe("c2");
    unmount();
    render(<NovelReader chapters={chapters} />);
    const again = screen.getByRole("region", { name: "正文" });
    fireEvent.keyDown(again, { key: "ArrowDown", altKey: true });
    expect(again.getAttribute("data-novel-chapter")).toBe("c2");
  });

  it("夜间纸色只包住正文，设置抽屉半透明且不收走当前句", () => {
    mockBox();
    render(<NovelReader chapters={chapters} paper="night" />);
    const article = document.querySelector("article");
    expect(article?.getAttribute("data-theme")).toBe("dark");
    expect(article?.className).toContain("bg-surface");
    expect(article?.className).toContain("text-muted-foreground");
    const region = screen.getByRole("region", { name: "正文" });
    expect(region.hasAttribute("data-theme")).toBe(false);
    expect(region.className.includes("bg-surface")).toBe(false);
    expect(region.className.includes("text-muted-foreground")).toBe(false);
    const sentence = screen.getByText("河面暗下来。");
    fireEvent.click(region, { clientX: 200, clientY: 200 });
    fireEvent.click(screen.getByRole("button", { name: "阅读设置" }));
    const dialog = screen.getByRole("dialog", { name: "阅读设置" });
    expect(dialog.className).toContain("bg-surface/80");
    expect(dialog.className).toContain("bottom-0");
    expect(dialog.contains(sentence)).toBe(false);
    expect(screen.getByRole("radio", { name: "仿真" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "字号" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "行距" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "栏宽" })).toBeTruthy();
    const offset = region.getAttribute("data-novel-offset");
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog", { name: "阅读设置" })).toBeNull();
    expect(region.getAttribute("data-novel-offset")).toBe(offset);
    expect(document.activeElement).toBe(region);
    expect(screen.getByText("河面暗下来。")).toBeTruthy();
  });
});
