import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle } from "./navbar";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("Navbar", () => {
  it("渲染 nav + 子内容", () => {
    const { getByText, container } = render(
      <Navbar>
        <NavbarBrand>瑚琏</NavbarBrand>
      </Navbar>,
    );
    expect(container.querySelector("nav")).toBeTruthy();
    expect(getByText("瑚琏")).toBeTruthy();
  });

  it("sticky 加 sticky/top-0；bordered=false 无下边框", () => {
    const { container } = render(<Navbar sticky bordered={false} />);
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("sticky");
    expect(nav.className).not.toContain("border-b");
  });

  it("NavbarContent justify=center", () => {
    const { container } = render(
      <NavbarContent justify="center">
        <NavbarItem>x</NavbarItem>
      </NavbarContent>,
    );
    expect(container.firstElementChild!.className).toContain("justify-center");
  });

  // hulianui/hulian#81：NavbarBrand 是 shrink-0、两个 NavbarContent 是 flex-1，
  // 三段不对称 → justify="center" 只在「自己那一格」居中，实际偏左（实测 265px）。
  // 真实的居中断言在 navbar.browser.test.tsx（jsdom 无布局引擎）。
  describe("NavbarBrand 伸缩", () => {
    const brandOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;

    it("默认可伸长（flex-1 basis-0），与 NavbarContent 同一份伸缩性", () => {
      const { container } = render(<NavbarBrand>瑚琏</NavbarBrand>);
      expect(brandOf(container).className).toContain("flex-1");
      expect(brandOf(container).className).toContain("basis-0");
      expect(brandOf(container).className).not.toContain("shrink-0");
    });

    it("grow={false} 回到定宽（shrink-0），给存量两段式版式留出口", () => {
      const { container } = render(<NavbarBrand grow={false}>瑚琏</NavbarBrand>);
      expect(brandOf(container).className).toContain("shrink-0");
      expect(brandOf(container).className).not.toContain("flex-1");
    });

    it("grow 不落到 DOM 上（不是合法 div 属性）", () => {
      const { container } = render(<NavbarBrand grow={false}>瑚琏</NavbarBrand>);
      expect(brandOf(container).hasAttribute("grow")).toBe(false);
    });
  });

  it("NavbarItem isActive → aria-current=page + 高亮", () => {
    const { getByText } = render(<NavbarItem isActive>组件</NavbarItem>);
    const li = getByText("组件");
    expect(li.getAttribute("aria-current")).toBe("page");
    expect(li.className).toContain("text-primary");
  });

  it("MenuToggle 点击触发 onToggle，aria-expanded 反映 isOpen", () => {
    const onToggle = vi.fn();
    const { getByRole, rerender } = render(<NavbarMenuToggle isOpen={false} onToggle={onToggle} />);
    const btn = getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-label")).toBe("打开菜单");
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
    rerender(<NavbarMenuToggle isOpen onToggle={onToggle} />);
    expect(getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("ConfigProvider locale=enUS localizes the default menu label", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <NavbarMenuToggle />
      </ConfigProvider>,
    );
    expect(getByRole("button", { name: "Open menu" })).toBeTruthy();
  });

  it("legacy locale falls back to Chinese and an explicit aria-label stays authoritative", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, navbar: undefined } };
    const { getByRole, rerender } = render(
      <ConfigProvider locale={legacy}>
        <NavbarMenuToggle />
      </ConfigProvider>,
    );
    expect(getByRole("button", { name: "打开菜单" })).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <NavbarMenuToggle aria-label="Toggle navigation" />
      </ConfigProvider>,
    );
    expect(getByRole("button", { name: "Toggle navigation" })).toBeTruthy();
  });
});

describe("Navbar · size / variant / soft 项 / NavbarMenu", () => {
  it("默认渲染不变：h-16 + 卡面色 + 实线分隔", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("h-16");
    expect(nav.className).toContain("bg-surface/80");
    expect(nav.className).toContain("border-border");
  });

  it("size=sm + variant=page：56px、页面底色、淡分隔线", () => {
    const { container } = render(<Navbar size="sm" variant="page" />);
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("h-14");
    expect(nav.className).toContain("bg-bg/75");
    expect(nav.className).toContain("border-border/60");
    expect(nav.className).not.toContain("bg-surface/80");
  });

  it("NavbarItem variant=soft：选中铺主色浅底，链接整块可点", () => {
    const { getByRole } = render(
      <ul>
        <NavbarItem variant="soft" isActive>
          <a href="#">组件</a>
        </NavbarItem>
      </ul>,
    );
    const li = getByRole("listitem");
    expect(li.className).toContain("bg-primary-subtle");
    expect(li.className).toContain("has-[>a]:p-0");
    expect(li.getAttribute("aria-current")).toBe("page");
  });

  it("NavbarMenu 收起不渲染、展开按断点隐藏；Toggle 跟同一档", () => {
    const { container, rerender } = render(
      <NavbarMenu isOpen={false} breakpoint="xl">
        <NavbarItem>组件</NavbarItem>
      </NavbarMenu>,
    );
    expect(container.querySelector("ul")).toBeNull();
    rerender(
      <NavbarMenu isOpen breakpoint="xl">
        <NavbarItem>组件</NavbarItem>
      </NavbarMenu>,
    );
    expect(container.querySelector("ul")!.className).toContain("xl:hidden");
    const { getByRole } = render(<NavbarMenuToggle breakpoint="xl" />);
    expect(getByRole("button").className).toContain("xl:hidden");
    expect(getByRole("button").className).not.toContain("sm:hidden");
  });
});
