import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DeployStatus } from "./deploy-status";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("DeployStatus", () => {
  it("稳定父更新时跳过状态件子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <DeployStatus status="building" variant="badge" size="md" />
    ));
  });

  it("默认 badge 渲染状态文案", () => {
    const { getByText } = render(<DeployStatus status="ready" />);
    expect(getByText("已上线")).toBeTruthy();
  });

  it("各状态有对应默认文案", () => {
    const { getByText, rerender } = render(<DeployStatus status="queued" />);
    expect(getByText("排队中")).toBeTruthy();
    rerender(<DeployStatus status="building" />);
    expect(getByText("构建中")).toBeTruthy();
    rerender(<DeployStatus status="error" />);
    expect(getByText("失败")).toBeTruthy();
  });

  it("building 图标旋转，可关 spin", () => {
    const { container, rerender } = render(<DeployStatus status="building" />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    rerender(<DeployStatus status="building" spin={false} />);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("ready 映射 success 软底", () => {
    const { container } = render(<DeployStatus status="ready" />);
    expect(container.querySelector(".bg-success\\/12")).toBeTruthy();
  });

  it("icon 形态用 role=img + aria-label 播报状态", () => {
    const { getByRole } = render(<DeployStatus status="error" variant="icon" />);
    expect(getByRole("img").getAttribute("aria-label")).toBe("失败");
  });

  it("dot 形态 building 有脉冲", () => {
    const { container } = render(<DeployStatus status="building" variant="dot" />);
    expect(container.querySelector(".animate-ping")).toBeTruthy();
  });

  it("label 覆盖默认文案", () => {
    const { getByText } = render(<DeployStatus status="ready" label="生产已发布" />);
    expect(getByText("生产已发布")).toBeTruthy();
  });

  it("uses ConfigProvider locale for built-in status labels", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <DeployStatus status="ready" variant="icon" />
      </ConfigProvider>,
    );
    expect(getByRole("img").getAttribute("aria-label")).toBe("Ready");
  });
});
