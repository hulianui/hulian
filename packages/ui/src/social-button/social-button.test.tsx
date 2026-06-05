import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { SocialButton } from "./social-button";

describe("SocialButton", () => {
  it("默认渲染品牌默认文案", () => {
    const { getByText } = render(<SocialButton provider="wechat" />);
    expect(getByText("微信登录")).toBeTruthy();
  });

  it("children 覆盖默认文案", () => {
    const { getByText, queryByText } = render(<SocialButton provider="github">用 GitHub 继续</SocialButton>);
    expect(getByText("用 GitHub 继续")).toBeTruthy();
    expect(queryByText("GitHub登录")).toBeNull();
  });

  it("shape=icon 不渲染文案，挂 aria-label 为品牌名", () => {
    const { getByLabelText, container } = render(<SocialButton provider="alipay" shape="icon" />);
    expect(getByLabelText("支付宝")).toBeTruthy();
    expect(container.querySelector("span")).toBeNull();
  });

  it("outline（默认）彩色品牌 logo 着品牌色", () => {
    const { container } = render(<SocialButton provider="wechat" />);
    const svg = container.querySelector("svg")!;
    expect((svg as SVGElement).style.color).toBeTruthy();
  });

  it("solid 彩色品牌：白字 + 品牌底色", () => {
    const { getByRole } = render(<SocialButton provider="weibo" variant="solid" />);
    const btn = getByRole("button");
    expect(btn.className).toContain("text-white");
    expect(btn.style.backgroundColor).toBeTruthy();
  });

  it("solid 黑白品牌(github)：走主题前景 token，不绑固定底色", () => {
    const { getByRole } = render(<SocialButton provider="github" variant="solid" />);
    const btn = getByRole("button");
    expect(btn.className).toContain("bg-foreground");
    expect(btn.style.backgroundColor).toBe("");
  });

  it("loading 渲染转圈并禁用", () => {
    const { getByRole, container } = render(<SocialButton provider="qq" loading />);
    expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("点击触发 onClick", () => {
    const fn = vi.fn();
    const { getByRole } = render(<SocialButton provider="x" onClick={fn} />);
    fireEvent.click(getByRole("button"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("disabled 阻止点击", () => {
    const fn = vi.fn();
    const { getByRole } = render(<SocialButton provider="apple" disabled onClick={fn} />);
    fireEvent.click(getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });

  it("透传 className", () => {
    const { getByRole } = render(<SocialButton provider="google" className="my-social" />);
    expect(getByRole("button").classList.contains("my-social")).toBe(true);
  });
});
