import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ToolCall } from "./tool-call";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN, type Locale } from "../config/locale";

describe("ToolCall", () => {
  it("渲染工具名 + 默认完成状态", () => {
    const { getByText } = render(<ToolCall name="search_web" />);
    expect(getByText("search_web")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
  });
  it("running 状态渲转圈 spinner + 文案运行中", () => {
    const { container, getByText } = render(<ToolCall name="run_code" status="running" />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(getByText("运行中")).toBeTruthy();
  });
  it("error 状态文案失败", () => {
    const { getByText } = render(<ToolCall name="fetch" status="error" />);
    expect(getByText("失败")).toBeTruthy();
  });
  it("defaultOpen 时面板参数/结果可见", () => {
    const { getByText } = render(
      <ToolCall name="t" defaultOpen input="{q:1}" output="ok" />,
    );
    expect(getByText("参数")).toBeTruthy();
    expect(getByText("结果")).toBeTruthy();
  });
  it("ConfigProvider locale=enUS localizes the input/output headings", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <ToolCall name="t" defaultOpen input="payload" output="response" />
      </ConfigProvider>,
    );
    expect(getByText("Input")).toBeTruthy();
    expect(getByText("Output")).toBeTruthy();
  });

  it("accepts a legacy four-field toolCall locale and falls back for new headings", () => {
    const legacyLocale: Locale = {
      ...zhCN,
      components: {
        ...zhCN.components!,
        toolCall: {
          pending: "Queued",
          running: "Working",
          success: "Done",
          error: "Broken",
        },
      },
    };

    const { getByText } = render(
      <ConfigProvider locale={legacyLocale}>
        <ToolCall name="legacy_tool" defaultOpen input="payload" output="response" />
      </ConfigProvider>,
    );
    expect(getByText("Done")).toBeTruthy();
    expect(getByText("参数")).toBeTruthy();
    expect(getByText("结果")).toBeTruthy();
  });
});
