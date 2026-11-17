import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";
import { Paper, PaperOutline, PaperSection, SecRef } from ".";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Doc({ showMethod = true }: { showMethod?: boolean }) {
  return (
    <Paper>
      <PaperOutline />
      <p>
        <SecRef to="intro" /> <SecRef to="model" /> <SecRef to="objects" /> <SecRef to="ack" />{" "}
        <SecRef to="branch" />
      </p>
      <PaperSection id="intro" title="Introduction">
        <p>intro</p>
      </PaperSection>
      {showMethod ? (
        <PaperSection id="model" title="Model">
          <PaperSection id="trees" title="Three trees">
            <PaperSection id="index" title="The index" />
          </PaperSection>
          <PaperSection id="objects" title="Objects" />
        </PaperSection>
      ) : null}
      <PaperSection id="branch" title="Branching" />
      <PaperSection id="ack" title="Acknowledgements" numbered={false} />
    </Paper>
  );
}

const refs = () => [...document.querySelectorAll("[data-sec-ref]")].map((a) => a.textContent);

describe("PaperSection 编号", () => {
  it("服务端渲染就带计数器：编号的章节加一，正文容器重置下一层，不编号的不加", () => {
    const html = renderToString(<Doc />);
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector("[data-paper]")!.className).toContain("paper-section");
    const sections = [...doc.querySelectorAll("[data-paper-section]")];
    expect(sections.map((s) => s.className.includes("[counter-increment:paper-section]"))).toEqual([
      true, true, true, true, true, true, false,
    ]);
    expect(sections[0].querySelector("[data-paper-section-number]")).not.toBeNull();
    expect(sections[6].querySelector("[data-paper-section-number]")).toBeNull();
    // 标题标签按嵌套深度取
    expect(sections.map((s) => s.querySelector("[data-paper-section-title]")!.tagName)).toEqual([
      "H2", "H2", "H3", "H4", "H3", "H2", "H2",
    ]);
  });

  it("服务端渲染时 SecRef 先占位「第 ? 节」", () => {
    const html = renderToString(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    expect(html).toContain("第 ? 节");
  });

  it("titleAs 覆盖默认标签", () => {
    render(
      <Paper>
        <PaperSection id="x" title="X" titleAs="h1" />
      </Paper>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "X" })).toBeTruthy();
  });
});

describe("SecRef", () => {
  it("按文档顺序和嵌套取层级号；不编号的章节引用显示标题", () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    expect(refs()).toEqual(["第 1 节", "第 2 节", "第 2.2 节", "Acknowledgements", "第 3 节"]);
  });

  it("英文界面用 Section N；Paper 的 labels.section 优先", () => {
    const { unmount } = render(
      <ConfigProvider locale={enUS}>
        <Doc />
      </ConfigProvider>,
    );
    expect(refs()[2]).toBe("Section 2.2");
    unmount();
    render(
      <ConfigProvider locale={zhCN}>
        <Paper labels={{ section: (n) => `§${n}` }}>
          <SecRef to="a" />
          <PaperSection id="a" title="A" />
        </Paper>
      </ConfigProvider>,
    );
    expect(refs()).toEqual(["§1"]);
  });

  it("章节增删后重新取号", () => {
    function Toggle() {
      const [show, setShow] = useState(true);
      return (
        <ConfigProvider locale={enUS}>
          <button onClick={() => setShow((v) => !v)}>toggle</button>
          <Doc showMethod={show} />
        </ConfigProvider>
      );
    }
    render(<Toggle />);
    expect(refs()[4]).toBe("Section 3");
    fireEvent.click(screen.getByText("toggle"));
    expect(refs()[4]).toBe("Section 2");
  });

  it("点击：阻止默认跳转并描边标题约 1.2 秒；找不到时告警且保留锚点行为", () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Paper>
        <SecRef to="a">go</SecRef>
        <SecRef to="missing">nowhere</SecRef>
        <PaperSection id="a" title="A" />
      </Paper>,
    );
    const title = document.querySelector("#a [data-paper-section-title]")!;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      screen.getByText("go").dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(title.hasAttribute("data-highlight")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(title.hasAttribute("data-highlight")).toBe(false);

    const missing = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      screen.getByText("nowhere").dispatchEvent(missing);
    });
    expect(missing.defaultPrevented).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("missing"));
    warn.mockRestore();
  });
});

describe("PaperOutline", () => {
  it("列出两层章节，编号与正文一致，第三层不进目录", () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    const nav = screen.getByRole("navigation", { name: "目录" });
    const links = [...nav.querySelectorAll("a")].map((a) => [a.getAttribute("href"), a.textContent]);
    expect(links).toEqual([
      ["#intro", "1Introduction"],
      ["#model", "2Model"],
      ["#trees", "2.1Three trees"],
      ["#objects", "2.2Objects"],
      ["#branch", "3Branching"],
      ["#ack", "Acknowledgements"],
    ]);
  });

  it("depth=1 只列顶层；打印形态不渲染", () => {
    const { unmount } = render(
      <Paper>
        <PaperOutline depth={1} aria-label="toc" />
        <PaperSection id="a" title="A">
          <PaperSection id="b" title="B" />
        </PaperSection>
      </Paper>,
    );
    expect([...screen.getByRole("navigation", { name: "toc" }).querySelectorAll("a")].map((a) => a.textContent)).toEqual([
      "1A",
    ]);
    unmount();
    render(
      <Paper defaultMode="print">
        <PaperOutline aria-label="toc" />
        <PaperSection id="a" title="A" />
      </Paper>,
    );
    expect(screen.queryByRole("navigation", { name: "toc" })).toBeNull();
  });
});
