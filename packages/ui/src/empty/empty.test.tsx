import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Empty } from "./empty";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Empty", () => {
  it("稳定父更新时跳过空态子树", async () => {
    await expectMemoSkipsSubtree(() => <Empty title="暂无数据" description="空空如也" />);
  });

  it("渲染标题与描述", () => {
    const { getByText } = render(<Empty title="暂无数据" description="空空如也" />);
    expect(getByText("暂无数据")).toBeTruthy();
    expect(getByText("空空如也")).toBeTruthy();
  });

  it("默认渲染内置图标（svg）", () => {
    const { container } = render(<Empty title="x" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("icon={null} 不渲染图标", () => {
    const { container } = render(<Empty icon={null} title="x" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("自定义 icon 覆盖内置", () => {
    const { getByTestId, container } = render(<Empty icon={<i data-testid="custom" />} title="x" />);
    expect(getByTestId("custom")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("children 作为操作区渲染", () => {
    const { getByText } = render(
      <Empty title="x">
        <button>新建</button>
      </Empty>,
    );
    expect(getByText("新建")).toBeTruthy();
  });

  it("size=sm 收紧内边距", () => {
    const { container } = render(<Empty size="sm" title="x" />);
    expect((container.firstElementChild as HTMLElement).classList.contains("py-6")).toBe(true);
  });

  // ---- loading（#245）------------------------------------------------------

  it("不传 loading 时不打 aria-busy（与改动前逐字相同）", () => {
    const { container } = render(<Empty title="暂无数据" />);
    expect((container.firstElementChild as HTMLElement).hasAttribute("aria-busy")).toBe(false);
  });

  it("loading 时容器打 aria-busy，读屏不会把它当最终内容读", () => {
    const { container } = render(<Empty loading title="正在加载" />);
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-busy")).toBe("true");
  });

  it("loading 时图标区换成 spinner（role=status），不再是空插画", () => {
    const { container } = render(<Empty loading />);
    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    // 「加载中」这句话由 spinner 的本地化 aria-label 播报，不是硬编码在 Empty 里
    expect(status?.getAttribute("aria-label")).toBeTruthy();
  });

  it("loading 时自定义 icon 也让位给 spinner", () => {
    const { queryByTestId, container } = render(<Empty loading icon={<i data-testid="custom" />} />);
    expect(queryByTestId("custom")).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeTruthy();
  });

  it("icon={null} 时 loading 依然不渲染图标区", () => {
    const { container } = render(<Empty loading icon={null} title="正在加载" />);
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("spinner 带 motion-reduce 停转类（新引入的动效要响应减弱偏好）", () => {
    const { container } = render(<Empty loading />);
    const status = container.querySelector('[role="status"]') as HTMLElement;
    expect(status.className).toContain("motion-reduce:[&_svg]:animate-none");
  });

  it("loading 时插画尺寸类不落到 spinner 上（否则内层 svg 会撑出外框）", () => {
    const { container } = render(<Empty loading />);
    expect(container.innerHTML).not.toContain("[&_svg]:size-14");
  });

  it("loading 时 title/description/children 照常渲染（各态各喂各的文案）", () => {
    const { getByText } = render(
      <Empty loading title="正在加载" description="稍候">
        <button>取消</button>
      </Empty>,
    );
    expect(getByText("正在加载")).toBeTruthy();
    expect(getByText("稍候")).toBeTruthy();
    expect(getByText("取消")).toBeTruthy();
  });
});
