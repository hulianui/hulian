import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { FigureRaster, Paper, PaperFigure } from ".";

// 画栅格要真 canvas，见 figure-raster.browser.test.tsx；这里只验服务端输出。
describe("FigureRaster · 服务端渲染", () => {
  it("输出没有 href 的 <image>，位置与尺寸已占好，不调用 draw", () => {
    const draw = vi.fn();
    const html = renderToString(
      <Paper>
        <PaperFigure id="heat" states={{ a: 1 }} caption="栅格">
          {() => (
            <svg viewBox="0 0 200 100">
              <FigureRaster x={4} y={6} width={120} height={50} resolution={[12, 5]} pixelated draw={draw} />
            </svg>
          )}
        </PaperFigure>
      </Paper>,
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const image = doc.querySelector("image[data-figure-raster]")!;
    expect(image).not.toBeNull();
    expect(image.hasAttribute("href")).toBe(false);
    expect([image.getAttribute("x"), image.getAttribute("y"), image.getAttribute("width"), image.getAttribute("height")]).toEqual(["4", "6", "120", "50"]);
    expect(image.getAttribute("preserveAspectRatio")).toBe("none");
    expect(draw).not.toHaveBeenCalled();
  });
});
