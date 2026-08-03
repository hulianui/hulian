import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "./navbar";

afterEach(cleanup);

// hulianui/hulian#81：`justify="center"` 段并不在导航栏中心。
// 这条只能在真实浏览器里量 —— jsdom 没有布局引擎，所有 rect 恒为 0，
// 「偏左 265px」这类结论在 unit project 里一律不可信。
const NAV_WIDTH = 1200;

function Shell({ brand, grow }: { brand: string; grow?: boolean }) {
  return (
    <div style={{ width: NAV_WIDTH }}>
      <Navbar>
        <NavbarBrand {...(grow === undefined ? {} : { grow })}>{brand}</NavbarBrand>
        <NavbarContent justify="center" aria-label="主导航">
          <NavbarItem>组件</NavbarItem>
          <NavbarItem>区块</NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end" aria-label="操作区">
          <NavbarItem>登录</NavbarItem>
        </NavbarContent>
      </Navbar>
    </div>
  );
}

const midOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
};
const navMid = () => midOf(document.querySelector("nav")!);
const centerSeg = () => screen.getByLabelText("主导航");

describe("Navbar 三段布局（真实浏览器）", () => {
  it("justify=\"center\" 段的中心落在 nav 中心", () => {
    render(<Shell brand="瑚琏 UI" />);
    expect(Math.abs(midOf(centerSeg()) - navMid())).toBeLessThan(1);
  });

  it("居中段里的导航项本身也在 nav 中心（读者看到的是这个）", () => {
    render(<Shell brand="瑚琏 UI" />);
    const items = [...centerSeg().querySelectorAll("li")];
    const itemsMid = (midOf(items[0]) + midOf(items.at(-1)!)) / 2;
    expect(Math.abs(itemsMid - navMid())).toBeLessThan(1);
  });

  it("偏移不随品牌名长度变化（同一份代码在不同租户站点上一致）", () => {
    const { unmount } = render(<Shell brand="琏" />);
    const short = midOf(centerSeg()) - navMid();
    unmount();
    render(<Shell brand="瑚琏企业级组件库 · 多租户控制台" />);
    expect(Math.abs(midOf(centerSeg()) - navMid() - short)).toBeLessThan(1);
  });

  it("brand / end 两段的内容仍各自贴边（视觉不变）", () => {
    render(<Shell brand="瑚琏 UI" />);
    const nav = document.querySelector("nav")!.getBoundingClientRect();
    const brandText = screen.getByText("瑚琏 UI").getBoundingClientRect();
    const login = screen.getByText("登录").getBoundingClientRect();
    // 24 = px-4/px-6 量级的内边距上限，贴边即可，不锁死具体值
    expect(brandText.left - nav.left).toBeLessThanOrEqual(24);
    expect(nav.right - login.right).toBeLessThanOrEqual(24);
  });

  // 反向复现：定宽 brand 正是 #81 的现场（居中段只居中在自己那一格）。
  // 这条同时证明上面几条不是「怎么写都过」的空断言。
  it("grow={false} 下居中段确实偏左（#81 原始现象）", () => {
    render(<Shell brand="瑚琏企业级组件库" grow={false} />);
    expect(midOf(centerSeg()) - navMid()).toBeLessThan(-30);
  });

  it("grow={false}：回到定宽 brand（存量两段式版式的出口）", () => {
    const { unmount } = render(<Shell brand="瑚琏企业级组件库" grow={false} />);
    const tight = screen.getByText("瑚琏企业级组件库").closest("div")!.getBoundingClientRect().width;
    unmount();
    render(<Shell brand="瑚琏企业级组件库" />);
    const grown = screen.getByText("瑚琏企业级组件库").closest("div")!.getBoundingClientRect().width;
    expect(grown).toBeGreaterThan(tight);
  });
});
