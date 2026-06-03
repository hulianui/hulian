import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle } from "./navbar";

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
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
    rerender(<NavbarMenuToggle isOpen onToggle={onToggle} />);
    expect(getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });
});
