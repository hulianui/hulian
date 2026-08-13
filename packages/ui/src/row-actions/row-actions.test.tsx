import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RowActions } from "./row-actions";
import type { RowActionItem } from "./row-actions.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

const base: RowActionItem[] = [
  { key: "view", label: "查看" },
  { key: "edit", label: "编辑" },
  { key: "copy", label: "复制" },
  { key: "del", label: "删除", tone: "danger" },
];

const openMore = () => fireEvent.click(screen.getByRole("button", { name: "更多操作" }));

describe("RowActions", () => {
  it("动作数不超过 max 时全部露出，不出现溢出菜单", () => {
    render(<RowActions actions={base.slice(0, 3)} />);
    expect(screen.getByText("查看")).toBeTruthy();
    expect(screen.getByText("编辑")).toBeTruthy();
    expect(screen.getByText("复制")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "更多操作" })).toBeNull();
  });

  it("超出时露出 max-1 个，其余进菜单（留一格给菜单键本身，列宽才不会比 max 还宽）", () => {
    render(<RowActions actions={base} max={3} />);
    expect(screen.getByText("查看")).toBeTruthy();
    expect(screen.getByText("编辑")).toBeTruthy();
    // 第 3 个开始收进菜单
    expect(screen.queryByText("复制")).toBeNull();
    openMore();
    expect(screen.getByRole("menuitem", { name: /复制/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /删除/ })).toBeTruthy();
  });

  it("hidden 的动作先被剔掉，不占折叠名额", () => {
    render(<RowActions actions={[{ key: "a", label: "甲", hidden: true }, ...base.slice(0, 3)]} max={3} />);
    expect(screen.queryByText("甲")).toBeNull();
    expect(screen.queryByRole("button", { name: "更多操作" })).toBeNull();
  });

  it("点击调 onSelect", () => {
    const onSelect = vi.fn();
    render(<RowActions actions={[{ key: "view", label: "查看", onSelect }]} />);
    fireEvent.click(screen.getByText("查看"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("禁用项不用原生 disabled：仍可聚焦可读名，但点击不触发", () => {
    const onSelect = vi.fn();
    render(
      <RowActions
        actions={[{ key: "del", label: "删除", disabled: true, disabledReason: "已开票不可删", onSelect }]}
      />,
    );
    const button = screen.getByRole("button", { name: /删除/ });
    // 原生 disabled 会让按钮既不可聚焦也不派发指针事件 —— 那样「为什么是灰的」这条提示永远弹不出来
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("菜单里的禁用项把原因写在名字后面（菜单里没有悬浮提示的位置）", () => {
    render(
      <RowActions
        max={2}
        actions={[
          { key: "view", label: "查看" },
          { key: "edit", label: "编辑" },
          { key: "del", label: "删除", disabled: true, disabledReason: "已开票不可删" },
        ]}
      />,
    );
    openMore();
    expect(within(screen.getByRole("menu")).getByText("已开票不可删")).toBeTruthy();
  });

  it("图标档用 label 当无障碍名（按钮上没有可见文字）", () => {
    render(
      <RowActions
        variant="icon"
        actions={[{ key: "view", label: "查看", icon: <svg data-testid="i" /> }]}
      />,
    );
    expect(screen.getByRole("button", { name: "查看" })).toBeTruthy();
    expect(screen.getByTestId("i")).toBeTruthy();
  });

  it("render 换成链接：导航型动作保住原生的开新标签能力", () => {
    render(
      <RowActions
        actions={[{ key: "view", label: "查看", render: <a href="/orders/1" /> }]}
      />,
    );
    const link = screen.getByRole("link", { name: "查看" });
    expect(link.getAttribute("href")).toBe("/orders/1");
  });

  describe("二次确认", () => {
    it("有 confirm 时先弹确认，确认后才跑动作", () => {
      const onSelect = vi.fn();
      render(
        <RowActions
          actions={[
            { key: "del", label: "删除", tone: "danger", onSelect, confirm: { title: "确认删除这条记录？" } },
          ]}
        />,
      );
      fireEvent.click(screen.getByText("删除"));
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByText("确认删除这条记录？")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "确定" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("取消不跑动作", () => {
      const onSelect = vi.fn();
      render(
        <RowActions
          actions={[{ key: "del", label: "删除", onSelect, confirm: { title: "确认删除？" } }]}
        />,
      );
      fireEvent.click(screen.getByText("删除"));
      fireEvent.click(screen.getByRole("button", { name: "取消" }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("折进菜单的动作，确认体验与露在外面时一致", () => {
      const onSelect = vi.fn();
      render(
        <RowActions
          max={2}
          actions={[
            { key: "view", label: "查看" },
            { key: "edit", label: "编辑" },
            { key: "del", label: "删除", tone: "danger", onSelect, confirm: { title: "确认删除？" } },
          ]}
        />,
      );
      openMore();
      fireEvent.click(screen.getByRole("menuitem", { name: /删除/ }));
      expect(screen.getByText("确认删除？")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "确定" }));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("确认框文案跟随 ConfigProvider", () => {
      render(
        <ConfigProvider locale={enUS}>
          <RowActions actions={[{ key: "del", label: "Delete", confirm: { title: "Delete this row?" } }]} />
        </ConfigProvider>,
      );
      fireEvent.click(screen.getByText("Delete"));
      expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    });
  });
});
