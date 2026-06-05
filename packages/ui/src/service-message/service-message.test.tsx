import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ServiceMessage } from "./service-message";

describe("ServiceMessage", () => {
  it("根元素 className 透传", () => {
    const { container } = render(<ServiceMessage className="my-sm" title="标题" />);
    expect(container.firstElementChild!.classList.contains("my-sm")).toBe(true);
  });

  it("渲染 source 与 title", () => {
    const { getByText } = render(<ServiceMessage source="瑞幸咖啡" title="商品领取提醒" />);
    expect(getByText("瑞幸咖啡")).toBeTruthy();
    expect(getByText("商品领取提醒")).toBeTruthy();
  });

  it("渲染 fields 键值对", () => {
    const { getByText } = render(
      <ServiceMessage
        title="t"
        fields={[
          { label: "取餐号", value: "361" },
          { label: "商品详情", value: "橙C冰茶" },
        ]}
      />,
    );
    expect(getByText("取餐号")).toBeTruthy();
    expect(getByText("361")).toBeTruthy();
    expect(getByText("橙C冰茶")).toBeTruthy();
  });

  it("label 用 text-muted，value 用 text-foreground + font-medium", () => {
    const { getByText } = render(
      <ServiceMessage title="t" fields={[{ label: "键", value: "值" }]} />,
    );
    expect(getByText("键").className).toContain("text-muted");
    const v = getByText("值");
    expect(v.className).toContain("text-foreground");
    expect(v.className).toContain("font-medium");
  });

  it("onMore 渲染更多按钮并触发", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<ServiceMessage title="t" onMore={fn} />);
    getByLabelText("更多").click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("无 onMore 时不渲染更多按钮", () => {
    const { queryByLabelText } = render(<ServiceMessage title="t" />);
    expect(queryByLabelText("更多")).toBeNull();
  });

  it("默认底部引导「进入小程序查看」+ 默认动作「小程序」", () => {
    const { getByText } = render(<ServiceMessage title="t" />);
    expect(getByText("进入小程序查看")).toBeTruthy();
    expect(getByText("小程序")).toBeTruthy();
  });

  it("footer={null} 隐藏整个底部", () => {
    const { queryByText } = render(<ServiceMessage title="t" footer={null} />);
    expect(queryByText("小程序")).toBeNull();
  });

  it("onAction 使底部成为可点击 button 并触发", () => {
    const fn = vi.fn();
    const { getByRole } = render(<ServiceMessage title="t" onAction={fn} />);
    getByRole("button").click(); // 无 onMore，仅底部一个 button
    expect(fn).toHaveBeenCalledOnce();
  });

  it("children 覆盖 fields", () => {
    const { getByText, queryByText } = render(
      <ServiceMessage title="t" fields={[{ label: "来自fields", value: "x" }]}>
        <div>自定义正文</div>
      </ServiceMessage>,
    );
    expect(getByText("自定义正文")).toBeTruthy();
    expect(queryByText("来自fields")).toBeNull();
  });

  it("自定义 action.label 覆盖默认「小程序」", () => {
    const { getByText, queryByText } = render(
      <ServiceMessage title="t" action={{ label: "查看详情" }} />,
    );
    expect(getByText("查看详情")).toBeTruthy();
    expect(queryByText("小程序")).toBeNull();
  });
});
