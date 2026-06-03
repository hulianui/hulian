import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./navigation-menu";

function Nav({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/p1" className="block">
              产品总览
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="/pricing">价格</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe("NavigationMenu", () => {
  it("渲染 nav + list + 触发器/链接项", () => {
    const { getByText, container } = render(<Nav />);
    expect(container.querySelector("nav")).toBeTruthy();
    expect(getByText("产品")).toBeTruthy();
    expect(getByText("价格")).toBeTruthy();
  });

  it("触发器带 chevron + data-[popup-open] 高亮钩子", () => {
    const { getByText } = render(<Nav />);
    const trigger = getByText("产品").closest("button")!;
    expect(trigger.querySelector("svg.lucide-chevron-down")).toBeTruthy();
    expect(trigger.className).toContain("data-[popup-open]:bg-surface-hover");
  });

  it("纯链接项渲染为 <a> 且带 href", () => {
    const { getByText } = render(<Nav />);
    const link = getByText("价格");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/pricing");
  });

  it("List 横向 flex 皮肤", () => {
    const { container } = render(<Nav />);
    // List 渲 role=list 或 ul/div；取含 flex 的列表容器
    const list = container.querySelector(".flex.items-center");
    expect(list).toBeTruthy();
  });

  it("defaultValue 初始打开对应 Item 的 Content（渲入共享浮层）", () => {
    const { getByText } = render(<Nav defaultValue="products" />);
    // Content Portal 到 body，render 的 getByText 默认搜 baseElement=body
    expect(getByText("产品总览")).toBeTruthy();
  });
});
