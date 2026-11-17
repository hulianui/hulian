import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";
import { Bibliography, Cite, Paper, PaperHeader } from ".";
import type { PaperMode } from ".";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const ENTRIES = [
  { id: "r1", content: "Hochreiter and Schmidhuber. Long short-term memory. 1997." },
  { id: "r2", content: "Sutskever et al. Sequence to sequence learning. 2014." },
  { id: "r3", content: "Bahdanau et al. Neural machine translation. 2014." },
  { id: "r4", content: "Gehring et al. Convolutional sequence to sequence. 2017." },
];

function Demo({ mode, cite }: { mode?: PaperMode; cite: string | string[] }) {
  return (
    <ConfigProvider locale={zhCN}>
      <Paper mode={mode}>
        <p>
          见 <Cite to={cite} data-testid="cite" />
        </p>
        <Bibliography entries={ENTRIES} />
      </Paper>
    </ConfigProvider>
  );
}

const text = () => screen.getByTestId("cite").textContent;

describe("Bibliography + Cite", () => {
  it("文献按顺序编号，标题跟随语言，条目 id 可作锚点", () => {
    render(<Demo cite="r2" />);
    expect(screen.getByRole("heading", { name: "参考文献" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "参考文献" })).toBeTruthy();
    const item = document.getElementById("r3")!;
    expect(item.tagName).toBe("LI");
    expect(item.textContent).toContain("[3]");
  });

  it("单条引用取号并链接到条目", () => {
    render(<Demo cite="r2" />);
    expect(text()).toBe("[2]");
    const link = screen.getByRole("link", { name: "2" });
    expect(link.getAttribute("href")).toBe("#r2");
  });

  it("多条引用排序去重，两个相邻写成「1, 2」，三个及以上连续压成「1–3」", () => {
    render(<Demo cite={["r2", "r1", "r2"]} />);
    expect(text()).toBe("[1, 2]");
    cleanup();
    render(<Demo cite={["r3", "r1", "r2"]} />);
    expect(text()).toBe("[1–3]");
    expect(screen.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["#r1", "#r3"]);
    cleanup();
    render(<Demo cite={["r4", "r1", "r2", "r3"]} />);
    expect(text()).toBe("[1–4]");
  });

  it("点击：条目描边一下", () => {
    vi.useFakeTimers();
    render(<Demo cite="r3" />);
    fireEvent.click(screen.getByRole("link", { name: "3" }));
    expect(document.getElementById("r3")!.hasAttribute("data-highlight")).toBe(true);
    vi.advanceTimersByTime(1300);
    expect(document.getElementById("r3")!.hasAttribute("data-highlight")).toBe(false);
  });

  it("找不到的 id 显示 ? 并告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Demo cite={["r1", "nope"]} />);
    expect(text()).toBe("[1, ?]");
    expect(warn.mock.calls.some((c) => String(c[0]).includes("nope"))).toBe(true);
    warn.mockRestore();
  });

  it("没有 Bibliography 时先占位 [?]", () => {
    render(
      <Paper>
        <Cite to="r1" data-testid="cite" />
      </Paper>,
    );
    expect(text()).toBe("[?]");
  });

  it("打印形态下链接去掉颜色", () => {
    render(<Demo cite="r1" mode="print" />);
    expect(screen.getByRole("link", { name: "1" }).className).toContain("text-inherit");
  });

  it("Paper labels 可以把标题换成论文的语言；title={null} 不渲染标题", () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Paper labels={{ references: "References" }}>
          <Bibliography entries={ENTRIES} />
        </Paper>
      </ConfigProvider>,
    );
    expect(screen.getByRole("heading", { name: "References" })).toBeTruthy();
    cleanup();
    render(
      <Paper>
        <Bibliography entries={ENTRIES} title={null} />
      </Paper>,
    );
    expect(screen.queryByRole("heading")).toBeNull();
  });
});

describe("PaperHeader", () => {
  it("题目、作者、说明行、摘要；摘要标题跟随界面语言", () => {
    render(
      <ConfigProvider locale={enUS}>
        <Paper>
          <PaperHeader
            title="Attention Is All You Need"
            authors={[
              { name: "Ashish Vaswani", affiliation: "Google Brain", email: "avaswani@google.com" },
              { name: "Illia Polosukhin" },
            ]}
            meta="NeurIPS 2017"
            abstract="The dominant sequence transduction models…"
          />
        </Paper>
      </ConfigProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Attention Is All You Need" })).toBeTruthy();
    expect(document.querySelectorAll("[data-paper-author]")).toHaveLength(2);
    expect(screen.getByText("Google Brain")).toBeTruthy();
    expect(screen.getByText("NeurIPS 2017")).toBeTruthy();
    const abstract = screen.getByRole("region", { name: "Abstract" });
    expect(abstract.textContent).toContain("The dominant sequence");
  });

  it("titleAs 换标签，没有摘要时不渲染摘要区", () => {
    render(<PaperHeader title="T" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "T" })).toBeTruthy();
    expect(document.querySelector("[data-paper-abstract]")).toBeNull();
  });
});
