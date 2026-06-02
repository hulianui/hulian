import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Drawer, DrawerContent, drawerVariants } from "./drawer";

describe("drawerVariants", () => {
  it("默认 right：贴右、border-l、滑出向右", () => {
    const c = drawerVariants({});
    expect(c).toContain("right-0");
    expect(c).toContain("inset-y-0");
    expect(c).toContain("border-l");
    expect(c).toContain("data-[ending-style]:translate-x-full");
  });
  it("left：贴左、border-r、负向滑出", () => {
    const c = drawerVariants({ side: "left" });
    expect(c).toContain("left-0");
    expect(c).toContain("border-r");
    expect(c).toContain("data-[starting-style]:-translate-x-full");
  });
  it("top：贴顶、border-b、纵向滑出", () => {
    const c = drawerVariants({ side: "top" });
    expect(c).toContain("top-0");
    expect(c).toContain("inset-x-0");
    expect(c).toContain("border-b");
    expect(c).toContain("data-[ending-style]:-translate-y-full");
  });
  it("bottom：贴底、border-t、正向纵滑", () => {
    const c = drawerVariants({ side: "bottom" });
    expect(c).toContain("bottom-0");
    expect(c).toContain("border-t");
    expect(c).toContain("data-[starting-style]:translate-y-full");
  });
  it("base 始终带 fixed + transition-transform + 语义皮肤", () => {
    const c = drawerVariants({});
    expect(c).toContain("fixed");
    expect(c).toContain("transition-transform");
    expect(c).toContain("bg-surface");
  });
});

describe("Drawer (defaultOpen 渲染)", () => {
  it("Portal 挂载 popup：title + 内容 + role=dialog 出现", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="设置面板">抽屉内容X</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("设置面板")).toBeTruthy();
    expect(screen.getByText("抽屉内容X")).toBeTruthy();
  });
  it("side 默认 right 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="t">x</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });
  it("side=left 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent side="left" title="t">
          x
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("left-0");
  });
  it("无 title 也能挂载内容", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>仅内容</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("仅内容")).toBeTruthy();
  });
});
