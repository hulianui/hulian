import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { LivePlayer } from "./live-player";

// jsdom 无 IntersectionObserver → NumberTicker(useInView) 需要桩；给永不触发的桩停在起始值。
beforeAll(() => {
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
  }
});

afterEach(cleanup);

describe("LivePlayer", () => {
  it("默认显示 LIVE 徽标", () => {
    const { getByText } = render(<LivePlayer />);
    expect(getByText("LIVE")).toBeTruthy();
  });

  it("live=false 不显示 LIVE", () => {
    const { queryByText } = render(<LivePlayer live={false} />);
    expect(queryByText("LIVE")).toBeNull();
  });

  it("渲染主播名与在线人数", () => {
    const { getByText } = render(<LivePlayer host={{ name: "主播阿楠" }} viewers={123} />);
    expect(getByText("主播阿楠")).toBeTruthy();
  });

  it("未关注显示关注钮，点击触发 onFollow", () => {
    let called = false;
    const { getByText } = render(<LivePlayer host={{ name: "主播", onFollow: () => (called = true) }} />);
    fireEvent.click(getByText("+ 关注"));
    expect(called).toBe(true);
  });

  it("followed 时显示已关注", () => {
    const { getByText } = render(<LivePlayer host={{ name: "主播", followed: true, onFollow: () => {} }} />);
    expect(getByText("已关注")).toBeTruthy();
  });

  it("清晰度菜单点击切换", () => {
    let q = "";
    const { getByText } = render(
      <LivePlayer qualities={["超清", "高清"]} quality="超清" onQualityChange={(v) => (q = v)} />,
    );
    fireEvent.click(getByText("超清 ▾"));
    fireEvent.click(getByText("高清"));
    expect(q).toBe("高清");
  });

  it("有 src 时渲染 video 元素", () => {
    const { container } = render(<LivePlayer src="/x.mp4" />);
    expect(container.querySelector("video")).toBeTruthy();
  });

  it("overlay 与 footer 插槽渲染", () => {
    const { getByText } = render(<LivePlayer overlay={<span>弹幕层</span>} footer={<span>互动栏</span>} />);
    expect(getByText("弹幕层")).toBeTruthy();
    expect(getByText("互动栏")).toBeTruthy();
  });
});
