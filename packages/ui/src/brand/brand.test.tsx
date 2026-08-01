import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Brand } from "./brand";

describe("Brand", () => {
  it("渲染徽章与品牌名", () => {
    const { getByText } = render(<Brand name="瑚琏" />);
    expect(getByText("瑚琏")).toBeTruthy();
  });

  it("mark 缺省时取品牌名首字（中文一个字）", () => {
    const { getByText } = render(<Brand name="瑚琏后台" />);
    expect(getByText("瑚")).toBeTruthy();
  });

  it("英文名取首字母并大写", () => {
    const { getByText } = render(<Brand name="hulian admin" />);
    expect(getByText("H")).toBeTruthy();
  });

  it("mark 可传图标/图片节点", () => {
    const { container } = render(<Brand name="瑚琏" mark={<svg data-logo />} />);
    expect(container.querySelector("[data-logo]")).toBeTruthy();
  });

  it("省略 name 只出徽章（侧栏收起态）", () => {
    const { container, queryByText } = render(<Brand mark="H" />);
    expect(queryByText("H")).toBeTruthy();
    expect(container.querySelectorAll("span").length).toBe(2); // 根 + 徽章
  });

  it("description 渲染副标题", () => {
    const { getByText } = render(<Brand name="瑚琏" description="v0.18.0" />);
    expect(getByText("v0.18.0")).toBeTruthy();
  });

  it("徽章是方角不是圆（区别 Avatar）", () => {
    const { container } = render(<Brand name="瑚琏" />);
    const markEl = container.querySelector("span > span") as HTMLElement;
    expect(markEl.className).toContain("rounded-[calc(var(--radius)");
    expect(markEl.className).not.toContain("rounded-full");
  });

  it("color 换徽章底色（语义色名走 token）", () => {
    const { container } = render(<Brand name="瑚琏" color="chart-3" />);
    const markEl = container.querySelector("span > span") as HTMLElement;
    expect(markEl.style.backgroundColor).toContain("--color-chart-3");
  });

  it("href 渲染成链接", () => {
    const { container } = render(<Brand name="瑚琏" href="/" />);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/");
  });

  it("render 逃生口接框架路由件，皮肤 class 合并进去", () => {
    const onClick = vi.fn();
    const { container, getByText } = render(
      <Brand name="瑚琏" render={<a data-router href="/home" onClick={onClick} />} />,
    );
    const el = container.querySelector("[data-router]") as HTMLAnchorElement;
    expect(el.getAttribute("href")).toBe("/home");
    expect(el.className).toContain("inline-flex");
    expect(getByText("瑚琏")).toBeTruthy();
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalled();
  });

  it("三档尺寸给不同徽章边长", () => {
    const size = (s: "sm" | "md" | "lg") => {
      const { container } = render(<Brand name="瑚琏" size={s} />);
      return (container.querySelector("span > span") as HTMLElement).className;
    };
    expect(size("sm")).toContain("size-7");
    expect(size("md")).toContain("size-9");
    expect(size("lg")).toContain("size-11");
  });
});
