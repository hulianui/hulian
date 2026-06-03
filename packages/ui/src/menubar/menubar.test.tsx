import { describe, it, expect } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "./menubar";

function Bar() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新建</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="danger">退出</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>编辑</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>撤销</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("渲染 role=menorbar 容器 + 顶层触发器", () => {
    const { getByText, container } = render(<Bar />);
    expect(getByText("文件")).toBeTruthy();
    expect(getByText("编辑")).toBeTruthy();
    // Base UI Menubar 渲 role=menubar
    expect(container.querySelector('[role="menubar"]')).toBeTruthy();
  });

  it("顶层触发器带菜单条项皮肤 + data-[popup-open] 高亮钩子", () => {
    const { getByText } = render(<Bar />);
    const t = getByText("文件");
    expect(t.className).toContain("px-3");
    expect(t.className).toContain("data-[popup-open]:bg-surface-hover");
  });

  it("点触发器打开下拉，项渲染", async () => {
    const { getByText } = render(<Bar />);
    fireEvent.click(getByText("文件"));
    await waitFor(() => expect(getByText("新建")).toBeTruthy());
    expect(getByText("退出")).toBeTruthy();
  });

  it("orientation=vertical → 容器 data-orientation 并切 flex-col 皮肤", () => {
    const { container } = render(
      <Menubar orientation="vertical">
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>新建</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const bar = container.querySelector('[role="menubar"]')!;
    expect(bar.getAttribute("data-orientation")).toBe("vertical");
    expect(bar.className).toContain("data-[orientation=vertical]:flex-col");
  });

  it("danger 项带 danger 皮肤（打开后）", async () => {
    const { getByText } = render(<Bar />);
    fireEvent.click(getByText("文件"));
    await waitFor(() => expect(getByText("退出")).toBeTruthy());
    expect(getByText("退出").className).toContain("text-danger");
  });
});
