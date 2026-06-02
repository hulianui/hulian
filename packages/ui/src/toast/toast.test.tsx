import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { toast, ToastProvider } from "./toast";

describe("Toast", () => {
  it("toast() 触发后 Provider 渲出 title 与 description", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存", description: "更改已成功同步。" });
    });
    expect(screen.getByText("已保存")).toBeTruthy();
    expect(screen.getByText("更改已成功同步。")).toBeTruthy();
  });
});
