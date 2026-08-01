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
  it("base 带 z-50 + 语义皮肤；定位(fixed/absolute)由 DrawerContent 按 container 决定，不写死在变体里", () => {
    const c = drawerVariants({});
    expect(c).toContain("z-50");
    expect(c).toContain("bg-surface");
    expect(c).not.toContain("fixed");
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

describe("DrawerContent 关闭按钮（hulianui/hulian#63）", () => {
  it("默认渲染右上角关闭按钮，带无障碍名", () => {
    const { getByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航">内容</DrawerContent>
      </Drawer>,
    );
    expect(getByLabelText("关闭")).toBeTruthy();
  });

  it("closeLabel 可覆盖无障碍名", () => {
    const { getByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航" closeLabel="收起菜单">
          内容
        </DrawerContent>
      </Drawer>,
    );
    expect(getByLabelText("收起菜单")).toBeTruthy();
  });

  it("showClose=false 关掉", () => {
    const { queryByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航" showClose={false}>
          内容
        </DrawerContent>
      </Drawer>,
    );
    expect(queryByLabelText("关闭")).toBeNull();
  });
})
