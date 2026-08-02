import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { Coupon } from "./coupon";

describe("Coupon", () => {
  it("amount 券渲染面额与门槛", () => {
    const { getByText } = render(<Coupon kind="amount" amount={50} threshold={299} title="满减券" />);
    expect(getByText("50")).toBeTruthy();
    expect(getByText("满299可用")).toBeTruthy();
  });

  it("discount 券渲染折扣", () => {
    const { getByText } = render(<Coupon kind="discount" discount={8.5} title="折扣券" />);
    expect(getByText("8.5")).toBeTruthy();
    expect(getByText("折")).toBeTruthy();
  });

  it("shipping 券显示包邮 + 无门槛", () => {
    const { getByText } = render(<Coupon kind="shipping" title="包邮券" />);
    expect(getByText("包邮")).toBeTruthy();
    expect(getByText("无门槛")).toBeTruthy();
  });

  it("无 threshold 的 amount 券显示无门槛", () => {
    const { getByText } = render(<Coupon kind="amount" amount={10} title="无门槛券" />);
    expect(getByText("无门槛")).toBeTruthy();
  });

  it("available 状态点击触发 onClaim", () => {
    const fn = vi.fn();
    const { getByText } = render(<Coupon amount={20} title="券" status="available" onClaim={fn} />);
    fireEvent.click(getByText("立即领取"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("claimed 状态点击触发 onUse", () => {
    const fn = vi.fn();
    const { getByText } = render(<Coupon amount={20} title="券" status="claimed" onUse={fn} />);
    fireEvent.click(getByText("去使用"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("used / expired 状态不渲染按钮，仅状态文案", () => {
    const { getByText, container } = render(<Coupon amount={20} title="券" status="used" />);
    expect(getByText("已使用")).toBeTruthy();
    expect(container.querySelector("button")).toBeNull();
  });

  it("inactive 状态置灰", () => {
    const { container } = render(<Coupon amount={20} title="券" status="expired" />);
    expect(container.firstElementChild!.className).toContain("grayscale");
  });

  it("selected 渲染高亮 ring", () => {
    const { container } = render(<Coupon amount={20} title="券" selected />);
    expect(container.firstElementChild!.className).toContain("ring-2");
  });

  it("onSelect 时整券可点且 role=button", () => {
    const fn = vi.fn();
    const { container } = render(<Coupon amount={20} title="券" onSelect={fn} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("role")).toBe("button");
    fireEvent.click(root);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("点击操作按钮不冒泡到 onSelect", () => {
    const onSelect = vi.fn();
    const onClaim = vi.fn();
    const { getByText } = render(
      <Coupon amount={20} title="券" status="available" onSelect={onSelect} onClaim={onClaim} />,
    );
    fireEvent.click(getByText("立即领取"));
    expect(onClaim).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("actionLabel 覆盖按钮文案", () => {
    const { getByText } = render(
      <Coupon amount={20} title="券" status="available" actionLabel="马上抢" onClaim={() => {}} />,
    );
    expect(getByText("马上抢")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes denomination, threshold, and status labels", () => {
    const { getByText, rerender } = render(
      <ConfigProvider locale={enUS}>
        <Coupon kind="discount" discount={8.5} threshold={199} title="Offer" onClaim={() => {}} />
      </ConfigProvider>,
    );
    expect(getByText("off")).toBeTruthy();
    expect(getByText("Spend ¥199 to use")).toBeTruthy();
    expect(getByText("Claim now")).toBeTruthy();

    rerender(
      <ConfigProvider locale={enUS}>
        <Coupon kind="shipping" title="Delivery" status="claimed" onUse={() => {}} />
      </ConfigProvider>,
    );
    expect(getByText("Free shipping")).toBeTruthy();
    expect(getByText("No minimum spend")).toBeTruthy();
    expect(getByText("Use now")).toBeTruthy();
  });

  it("legacy component dictionaries fall back to Chinese while actionLabel overrides enUS", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, coupon: undefined } };
    const { getByText, rerender } = render(
      <ConfigProvider locale={legacy}>
        <Coupon amount={20} title="券" onClaim={() => {}} />
      </ConfigProvider>,
    );
    expect(getByText("无门槛")).toBeTruthy();
    expect(getByText("立即领取")).toBeTruthy();

    rerender(
      <ConfigProvider locale={enUS}>
        <Coupon amount={20} title="Offer" actionLabel="Redeem" onClaim={() => {}} />
      </ConfigProvider>,
    );
    expect(getByText("Redeem")).toBeTruthy();
  });

  it("透传 className", () => {
    const { container } = render(<Coupon amount={20} title="券" className="my-coupon" />);
    expect(container.firstElementChild!.classList.contains("my-coupon")).toBe(true);
  });
});
