import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FigureRaster, Paper, PaperFigure, PaperPresenter, usePaperExport } from ".";
import type { FigureRasterProps, PaperExport, RasterColor } from ".";

/**
 * FigureRaster 只能在真实浏览器里验：要 canvas 编码 PNG，要 token 经过层叠后的计算色。
 */

afterEach(cleanup);

let api: PaperExport;
function Grab() {
  api = usePaperExport();
  return null;
}

/** 记下每次 draw 解析到的底色，画一个左半 primary、右半 bg 的 2×1 栅格。 */
function recorder() {
  const seen: RasterColor[] = [];
  const draw = vi.fn<FigureRasterProps["draw"]>((ctx, { color }) => {
    const fg = color("var(--color-primary)");
    const bg = color("var(--color-bg)");
    seen.push(bg);
    const image = ctx.createImageData(2, 1);
    image.data.set([...fg.slice(0, 3), 255, ...bg.slice(0, 3), 255]);
    ctx.putImageData(image, 0, 0);
  });
  return { draw, seen };
}

function Figure({ draw, id = "heat", pixelated = true }: { draw: FigureRasterProps["draw"]; id?: string; pixelated?: boolean }) {
  return (
    <PaperFigure id={id} states={{ a: 1, b: 2 }} printSubfigures={["a", "b"]} caption="栅格">
      {(n) => (
        <svg viewBox="0 0 200 100" role="img" aria-label={`栅格 ${n}`} className="block h-auto w-full">
          <FigureRaster x={0} y={0} width={200} height={100} resolution={[2, 1]} pixelated={pixelated} draw={draw} />
          <text x={10} y={90}>{n}</text>
        </svg>
      )}
    </PaperFigure>
  );
}

const hrefs = (root: ParentNode = document) =>
  [...root.querySelectorAll("image[data-figure-raster]")].map((el) => el.getAttribute("href") ?? "");

function load(src: string) {
  const img = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

/** 导出任务在槽的 effect 里启动：在 act 里发起、act 外等（见 paper-export.browser.test.tsx）。 */
async function settle(start: () => Promise<string>) {
  let pending!: Promise<string>;
  await act(async () => {
    pending = start();
  });
  try {
    return await pending;
  } finally {
    await act(async () => {});
  }
}

describe("FigureRaster", () => {
  it("把 draw 画的内容编码成 PNG 写进 <image href>；pixelated 时按整数倍放大", async () => {
    const { draw } = recorder();
    render(
      <Paper>
        <Figure draw={draw} />
      </Paper>,
    );
    const [href] = hrefs();
    expect(href.startsWith("data:image/png;base64,")).toBe(true);
    const img = await load(href);
    // 显示宽 200 × 3 倍过采样 → 至少 600 像素宽，且是 2 的整数倍。
    expect(img.naturalWidth).toBeGreaterThanOrEqual(600);
    expect(img.naturalWidth % 2).toBe(0);
    expect(img.naturalWidth / img.naturalHeight).toBe(2);
  });

  it("不放大时编码尺寸就是 resolution", async () => {
    const { draw } = recorder();
    render(
      <Paper>
        <Figure draw={draw} pixelated={false} />
      </Paper>,
    );
    const img = await load(hrefs()[0]);
    expect([img.naturalWidth, img.naturalHeight]).toEqual([2, 1]);
  });

  it("draw 引用不变时重渲染不重画；换了引用才重画", () => {
    const { draw } = recorder();
    const { rerender } = render(
      <Paper>
        <Figure draw={draw} />
      </Paper>,
    );
    const calls = draw.mock.calls.length;
    rerender(
      <Paper>
        <Figure draw={draw} />
      </Paper>,
    );
    expect(draw.mock.calls.length).toBe(calls);
    const other = recorder();
    rerender(
      <Paper>
        <Figure draw={other.draw} />
      </Paper>,
    );
    expect(other.draw).toHaveBeenCalledTimes(1);
  });

  it("颜色按所在位置的主题解析；data-theme 切换后重画", async () => {
    const { draw, seen } = recorder();
    render(
      <div data-theme="light" data-testid="island">
        <Paper>
          <Figure draw={draw} />
        </Paper>
      </div>,
    );
    const light = seen.at(-1)!;
    await act(async () => {
      screen.getByTestId("island").setAttribute("data-theme", "dark");
      // MutationObserver 是微任务回调。
      await Promise.resolve();
    });
    const dark = seen.at(-1)!;
    expect(seen.length).toBeGreaterThan(1);
    expect(dark).not.toEqual(light);
    // 暗色底比亮色底暗。
    expect(dark[0] + dark[1] + dark[2]).toBeLessThan(light[0] + light[1] + light[2]);
  });

  it("打印形态下主图和每张分图各画一份", () => {
    const { draw } = recorder();
    render(
      <Paper mode="print">
        <Figure draw={draw} />
      </Paper>,
    );
    const all = hrefs();
    expect(all).toHaveLength(3);
    for (const href of all) expect(href.startsWith("data:image/png")).toBe(true);
  });

  it("导出 SVG 时栅格以 PNG 内嵌（href + xlink:href），在暗色页面上也按亮色画", async () => {
    const { draw, seen } = recorder();
    render(
      <div data-theme="dark">
        <Paper>
          <Grab />
          <Figure draw={draw} />
        </Paper>
      </div>,
    );
    const pageBg = seen.at(-1)!;
    const text = await settle(() => api.exportFigureSvg("heat", "b"));
    const exportBg = seen.at(-1)!;
    expect(exportBg).not.toEqual(pageBg);
    expect(exportBg[0] + exportBg[1] + exportBg[2]).toBeGreaterThan(pageBg[0] + pageBg[1] + pageBg[2]);

    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    const image = doc.querySelector("image")!;
    expect(image.getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    expect(image.getAttributeNS("http://www.w3.org/1999/xlink", "href")).toBe(image.getAttribute("href"));
    expect(image.getAttribute("image-rendering")).toBe("pixelated");
    expect(image.getAttribute("width")).toBe("200");
    expect(text).not.toMatch(/\sclass=|\sdata-/);

    // 整份文件能当图片独立加载。
    const img = await load(URL.createObjectURL(new Blob([text], { type: "image/svg+xml" })));
    expect(img.naturalWidth).toBe(200);
  });

  it("演示层里重画的图同样有栅格", async () => {
    const { draw } = recorder();
    render(
      <Paper>
        <PaperPresenter trigger={<button type="button">演示</button>} />
        <Figure draw={draw} />
      </Paper>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "演示" }));
    });
    const stage = document.querySelector("[data-paper-presenter-figure]")!;
    expect(stage).not.toBeNull();
    const [href] = hrefs(stage);
    expect(href.startsWith("data:image/png")).toBe(true);
  });
});
