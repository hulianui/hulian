import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { NovelReader } from "./novel-reader";

/**
 * 纸色层是 absolute。正文视口若不是定位元素，CSS 绘制顺序会把纸画在正文之上：
 * DOM 里文字都在，屏幕上却是一页空白。jsdom 没有绘制，只能在真实浏览器里用命中测试抓。
 */

afterEach(cleanup);

const chapters = [
  { id: "c1", title: "夜航", content: "河面暗下来。沈晚把灯挂上桅杆。" },
  { id: "c2", title: "返程", content: "回程更轻。她把火重新点上。" },
];

// 纸色层是 pointer-events-none，elementFromPoint 会直接穿过它。命中测试前把它改成可命中，
// 这样返回的才是「画在最上面的那一层」。
function topmostAtCenter(el: Element) {
  const paper = el.closest("[data-novel-chapter]")?.firstElementChild;
  if (paper instanceof HTMLElement) paper.style.pointerEvents = "auto";
  const r = el.getBoundingClientRect();
  return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
}

describe("NovelReader 正文可见", () => {
  it("菜单收起（默认）时，正文不被纸色层盖住", () => {
    render(
      <div style={{ width: 640, height: 448 }}>
        <NovelReader className="h-[28rem]" title="渡口的灯" author="沈晚" chapters={chapters} />
      </div>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    const hit = topmostAtCenter(heading);
    expect(hit && heading.contains(hit)).toBe(true);
  });

  it("菜单展开时，正文同样不被盖住", () => {
    render(
      <div style={{ width: 640, height: 448 }}>
        <NovelReader className="h-[28rem]" chapters={chapters} defaultChromeOpen />
      </div>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    const hit = topmostAtCenter(heading);
    expect(hit && heading.contains(hit)).toBe(true);
  });
});
