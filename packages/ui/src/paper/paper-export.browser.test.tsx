import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { FigureStep, Paper, PaperFigure, ProcessFigure, usePaperExport } from ".";
import type { FigureSvgExportOptions, PaperExport } from ".";
import { createColorResolver } from "./svg-export";

/**
 * 导出 SVG 只能在真实浏览器里验：要的就是 Tailwind 类 + CSS 变量经过层叠后的计算值，
 * jsdom 没有层叠也没有 tokens，测出来全是空串。
 */

afterEach(cleanup);

let api: PaperExport;
function Grab() {
  api = usePaperExport();
  return null;
}

const steps = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
];

function Fixture({ theme = "dark" }: { theme?: "dark" | "light" }) {
  return (
    <div data-theme={theme} className="bg-bg text-foreground">
      <Paper>
        <Grab />
        <ProcessFigure id="arch" steps={steps} caption="架构">
          <svg viewBox="0 0 200 100" role="img" aria-label="三步示意" className="block h-auto w-full">
            <rect x={0} y={0} width={200} height={100} className="fill-foreground/[0.03]" data-testid="frame" />
            <FigureStep at="a">
              <rect x={10} y={10} width={40} height={20} className="fill-primary stroke-muted-foreground [stroke-width:1.5]" />
            </FigureStep>
            <FigureStep at="b">
              <path
                d="M0 50H200"
                className="fill-none stroke-muted-foreground group-data-[phase=on]/step:stroke-primary group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:animate-[hulian-paper-flow_0.9s_linear_infinite]"
              />
              <text x={100} y={80} textAnchor="middle" className="fill-foreground text-[13px] font-bold">
                b
              </text>
            </FigureStep>
            <FigureStep at="c">
              <circle cx={180} cy={20} r={8} className="fill-danger" />
            </FigureStep>
            <rect x={0} y={0} width={1} height={1} className="hidden" data-testid="gone" />
          </svg>
        </ProcessFigure>
        <PaperFigure id="canvas" states={{ x: 1 }} caption="canvas">
          {() => <canvas width={10} height={10} />}
        </PaperFigure>
      </Paper>
    </div>
  );
}

/**
 * 导出任务在槽的 effect 里启动：只能在 act 里「发起」、在 act 外「等」。
 * 在 act 里 await 结果会死锁 —— act 要等回调结束才提交 effect，回调又在等 effect 干完活。
 */
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

const exportSvg = (id: string, key: string, options?: FigureSvgExportOptions) =>
  settle(() => api.exportFigureSvg(id, key, options));

function parse(text: string) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  return doc.documentElement as unknown as SVGSVGElement;
}

/** 当前文档里某个语义色在亮色岛里的十六进制值。 */
function lightHex(className: string) {
  const island = document.createElement("div");
  island.dataset.theme = "light";
  island.innerHTML = `<svg><rect class="${className}" /></svg>`;
  document.body.appendChild(island);
  const fill = getComputedStyle(island.querySelector("rect")!).fill;
  const colors = createColorResolver(document);
  const hex = colors.resolve(fill)!.hex;
  colors.dispose();
  island.remove();
  return hex;
}

describe("usePaperExport · exportFigureSvg", () => {
  it("输出独立的 SVG：没有 class / data-*，颜色是十六进制，尺寸与 viewBox 齐备", async () => {
    render(<Fixture />);
    const text = await exportSvg("arch", "b");
    expect(text.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(text).not.toMatch(/\sclass=|\sdata-|\saria-|\srole=|oklch|oklab|lab\(|var\(/);

    const svg = parse(text);
    expect(svg.getAttribute("xmlns")).toBe("http://www.w3.org/2000/svg");
    expect(svg.getAttribute("viewBox")).toBe("0 0 200 100");
    expect(svg.getAttribute("width")).toBe("200");
    expect(svg.getAttribute("height")).toBe("100");
    expect(svg.querySelector("title")?.textContent).toBe("三步示意");
    for (const el of svg.querySelectorAll("[fill], [stroke]")) {
      for (const attr of ["fill", "stroke"]) {
        const v = el.getAttribute(attr);
        if (v !== null) expect(v).toMatch(/^(none|#[0-9a-f]{6})$/);
      }
    }
  });

  it("暗色页面上默认导出亮色；theme: current 按页面主题", async () => {
    render(<Fixture />);
    const light = parse(await exportSvg("arch", "all"));
    const circle = light.querySelector("circle")!;
    expect(circle.getAttribute("fill")).toBe(lightHex("fill-danger"));

    const current = parse(await exportSvg("arch", "all", { theme: "current" }));
    expect(current.querySelector("circle")!.getAttribute("fill")).not.toBe(circle.getAttribute("fill"));
  });

  it("步骤阶段的透明度、当前步的虚线和强调色都按导出的那个预设算，动画不进文件", async () => {
    render(<Fixture />);
    const svg = parse(await exportSvg("arch", "b"));
    const [frame, groupA, groupB, groupC] = [...svg.children].filter((c) => c.tagName !== "title");
    expect(frame.getAttribute("fill-opacity")).toBe("0.03");
    expect(groupA.getAttribute("opacity")).toBe("0.5"); // done
    expect(groupB.getAttribute("opacity")).toBeNull(); // on
    expect(groupC.getAttribute("opacity")).toBe("0.15"); // off

    const path = groupB.querySelector("path")!;
    expect(path.getAttribute("stroke")).toBe(lightHex("fill-primary"));
    expect(path.getAttribute("stroke-dasharray")).toBe("5 4");
    expect(path.getAttribute("stroke-dashoffset") ?? "0").toBe("0");

    const text = groupB.querySelector("text")!;
    expect(text.getAttribute("font-size")).toBe("13");
    expect(text.getAttribute("font-weight")).toBe("700");
    expect(svg.getAttribute("font-family")).toContain("STIX Two Text");
    expect(groupA.querySelector("rect")!.getAttribute("stroke-width")).toBe("1.5");

    // display:none 的元素不进文件。
    expect(svg.querySelectorAll("rect").length).toBe(2);
  });

  it("不影响正文里的图，也不在页面上留下导出用的节点", async () => {
    render(<Fixture />);
    const figure = document.getElementById("arch")!;
    expect(figure.getAttribute("data-state")).toBe("a");
    await exportSvg("arch", "c");
    expect(figure.getAttribute("data-state")).toBe("a");
    expect(document.querySelector("[data-paper-export]")).toBeNull();
  });

  it("width 与 background 选项", async () => {
    render(<Fixture />);
    const svg = parse(await exportSvg("arch", "a", { width: 400, background: "white" }));
    expect(svg.getAttribute("width")).toBe("400");
    expect(svg.getAttribute("height")).toBe("200");
    const bg = [...svg.children].find((c) => c.tagName === "rect")!;
    expect(bg.getAttribute("fill")).toBe("#ffffff");
    expect(bg.getAttribute("width")).toBe("200");
  });

  it("导出的文本能当成独立图片加载", async () => {
    render(<Fixture />);
    const text = await exportSvg("arch", "all");
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG 加载失败"));
    });
    img.src = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
    await loaded;
    expect(img.naturalWidth).toBe(200);
  });

  it("找不到图、预设不存在、画面不是单独一个 <svg> 时 reject", async () => {
    render(<Fixture />);
    await expect(api.exportFigureSvg("nope", "a")).rejects.toThrow(/找不到/);
    await expect(api.exportFigureSvg("arch", "zzz")).rejects.toThrow(/没有名为 "zzz"/);
    await expect(settle(() => api.exportFigureSvg("canvas", "x"))).rejects.toThrow(/<canvas>/);
  });

  it("在 Paper 外使用时 reject", async () => {
    render(<Grab />);
    await expect(api.exportFigureSvg("arch", "a")).rejects.toThrow(/Paper 里/);
    expect(screen.queryByRole("figure")).toBeNull();
  });
});
