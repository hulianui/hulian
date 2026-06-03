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
