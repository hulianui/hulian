import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { LiveProductCard } from "./live-product-card";

afterEach(cleanup);

describe("LiveProductCard", () => {
  it("渲染标题、现价、序号", () => {
    const { getByText } = render(<LiveProductCard index={3} image="x" title="羊羔绒外套" price={129} />);
    expect(getByText("羊羔绒外套")).toBeTruthy();
    expect(getByText("129")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });

  it("originalPrice 高于现价时显示划线原价", () => {
    const { getByText } = render(<LiveProductCard image="x" title="t" price={129} originalPrice={399} />);
    expect(getByText("¥399")).toBeTruthy();
  });

  it("originalPrice 不高于现价时不显示", () => {
    const { queryByText } = render(<LiveProductCard image="x" title="t" price={129} originalPrice={100} />);
    expect(queryByText("100")).toBeNull();
  });

  it("explaining 显示讲解中", () => {
    const { getByText } = render(<LiveProductCard image="x" title="t" price={1} explaining />);
    expect(getByText("讲解中")).toBeTruthy();
  });

  it("库存/已售文案", () => {
    const { getByText } = render(<LiveProductCard image="x" title="t" price={1} stock={86} sold={1240} />);
    expect(getByText(/已售 1240/)).toBeTruthy();
    expect(getByText(/仅剩 86/)).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes built-in commerce labels", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <LiveProductCard image="x" title="Jacket" price={1} explaining stock={86} sold={1240} />
      </ConfigProvider>,
    );
    expect(getByText("Presenting")).toBeTruthy();
    expect(getByText(/Sold 1240/)).toBeTruthy();
    expect(getByText(/86 left/)).toBeTruthy();
  });

  it("legacy component dictionaries fall back to Chinese", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, liveProductCard: undefined } };
    const { getByText } = render(
      <ConfigProvider locale={legacy}>
        <LiveProductCard image="x" title="t" price={1} explaining stock={2} sold={3} />
      </ConfigProvider>,
    );
    expect(getByText("讲解中")).toBeTruthy();
    expect(getByText(/已售 3/)).toBeTruthy();
  });

  it("小数价格保留两位", () => {
    const { getByText } = render(<LiveProductCard image="x" title="t" price={49.9} />);
    expect(getByText("49.90")).toBeTruthy();
  });

  it("onClick 触发", () => {
    let hit = false;
    const { getByText } = render(<LiveProductCard image="x" title="点我" price={1} onClick={() => (hit = true)} />);
    fireEvent.click(getByText("点我"));
    expect(hit).toBe(true);
  });

  it("action 插槽渲染", () => {
    const { getByText } = render(<LiveProductCard image="x" title="t" price={1} action={<span>去抢购</span>} />);
    expect(getByText("去抢购")).toBeTruthy();
  });
});
