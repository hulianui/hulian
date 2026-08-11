import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AlertDialog, AlertDialogContent, AlertDialogClose } from "./alert-dialog";

afterEach(cleanup);

describe("AlertDialog", () => {
  it("open 时渲染 title/description + role=alertdialog", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent title="确认删除A" description="此操作不可撤销。">
          <AlertDialogClose>取消</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("确认删除A")).toBeTruthy();
    expect(screen.getByText("此操作不可撤销。")).toBeTruthy();
    expect(document.querySelector('[role="alertdialog"]')).toBeTruthy();
  });

  it("关闭态不渲染内容", () => {
    render(
      <AlertDialog>
        <AlertDialogContent title="确认删除B">
          <AlertDialogClose>取消</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("确认删除B")).toBeNull();
  });

  it("透传 className 到 Popup", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent title="确认删除C" className="my-ad">
          <span>x</span>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(document.querySelector(".my-ad")).toBeTruthy();
  });

  it("body 渲染在 Description 之外，块级内容不会被塞进 <p>（#158）", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent
          title="确认删除E"
          description="将从各库中一并移除。"
          body={
            <div data-testid="summary">
              <div>冠亚/全日制劳动合同</div>
            </div>
          }
        >
          <AlertDialogClose>取消E</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const summary = screen.getByTestId("summary");
    // 非法嵌套的判据是「祖先里有没有 <p>」：浏览器会提前闭合 <p>，React 报 hydration mismatch。
    expect(summary.closest("p")).toBeNull();
    expect(screen.getByText("将从各库中一并移除。").tagName).toBe("P");
  });

  it("body 排在 description 之后、动作区之前", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent title="确认删除F" description="描述F" body={<div>正文F</div>}>
          <AlertDialogClose>取消F</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const popup = document.querySelector('[role="alertdialog"]') as HTMLElement;
    const order = ["描述F", "正文F", "取消F"].map((text) =>
      Array.from(popup.querySelectorAll("*")).findIndex((el) => el.textContent === text),
    );
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
  });

  it("icon 落在标题行左侧（与标题同一 flex 行，说明文案跟着标题缩进）", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent
          title="确认删除G"
          description="描述G"
          icon={<svg data-testid="warn" />}
        >
          <AlertDialogClose>取消G</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const row = screen.getByTestId("warn").closest("div") as HTMLElement;
    expect(row.className).toContain("flex");
    // 标题与说明在图标的兄弟列里 → 三者同属这一行
    expect(row.textContent).toContain("确认删除G");
    expect(row.textContent).toContain("描述G");
  });

  it("不传 icon 时不引入额外的 flex 行", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent title="确认删除H">
          <AlertDialogClose>取消H</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const popup = document.querySelector('[role="alertdialog"]') as HTMLElement;
    // 只剩底部动作区一个 flex 容器
    expect(popup.querySelectorAll("div.flex")).toHaveLength(1);
  });

  it("Close 按钮渲染在操作区", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent title="确认删除D">
          <AlertDialogClose>取消D</AlertDialogClose>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("取消D")).toBeTruthy();
  });
});
