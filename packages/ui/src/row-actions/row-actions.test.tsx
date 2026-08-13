import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, within } from "@testing-library/react";
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

  it("button 档渲染描边按钮，文字仍在（只有图标档才藏名字）", () => {
    const { getByRole } = render(
      <RowActions variant="button" actions={[{ key: "edit", label: "编辑" }]} />,
    );
    const button = getByRole("button", { name: "编辑" });
    expect(button.textContent).toContain("编辑");
    expect(button.className).toContain("border");
  });

  it("button 档的溢出菜单键也跟着有边框（免得一排按钮里冒出一颗无边框的 ⋯）", () => {
    const { getByRole } = render(
      <RowActions variant="button" max={2} actions={base} />,
    );
    expect(getByRole("button", { name: "更多操作" }).className).toContain("border");
  });

  it("text 档不画边框（一排边框会把表格切碎）", () => {
    const { getByRole } = render(<RowActions actions={[{ key: "edit", label: "编辑" }]} />);
    // 按类名边界切词：pressableClass 的过渡属性列表里含 border-color，裸 contains("border") 会假红
    expect(getByRole("button", { name: "编辑" }).className).not.toMatch(/(^|\s)border(\s|$)/);
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

  it("动作按钮接动效体系的按压反馈，且没把 Button 自带的颜色过渡挤掉", () => {
    const { getByRole } = render(<RowActions actions={[{ key: "edit", label: "编辑" }]} />);
    const cls = getByRole("button", { name: "编辑" }).className;
    // pressableClass 自带完整的 transition-property 列表，所以它必须是最后一条 transition-*：
    // tailwind-merge 只留最后一个，写反了颜色与按压只能活一个。
    expect(cls).toContain("active:scale-[0.97]");
    expect(cls).toContain("transition-[scale,background-color,border-color,color,box-shadow,filter,opacity]");
    expect(cls).not.toContain("transition-colors");
    // 减弱动效由库负责，不指望消费方去关
    expect(cls).toContain("motion-reduce:active:scale-100");
  });

  it("溢出菜单键同样有按压反馈", () => {
    const { getByRole } = render(<RowActions max={2} actions={base} />);
    expect(getByRole("button", { name: "更多操作" }).className).toContain("active:scale-[0.97]");
  });

  describe("异步动作", () => {
    it("onSelect 返回 Promise 时本项转圈，同组其他动作暂时点不动（一行里不该同时发两个写操作）", async () => {
      let resolve!: () => void;
      const slow = vi.fn(() => new Promise<void>((r) => (resolve = r)));
      const other = vi.fn();
      const { getByRole, getAllByRole } = render(
        <RowActions
          actions={[
            { key: "sync", label: "同步", onSelect: slow },
            { key: "other", label: "别的", onSelect: other },
          ]}
        />,
      );
      fireEvent.click(getByRole("button", { name: /同步/ }));
      expect(slow).toHaveBeenCalledTimes(1);

      const held = getAllByRole("button").find((b) => b.textContent?.includes("别的"))!;
      expect(held.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(held);
      expect(other).not.toHaveBeenCalled();

      await act(async () => {
        resolve();
      });
      expect(held.getAttribute("aria-disabled")).toBeNull();
    });

    it("确认框：成功才关，失败留在原地让用户能重试", async () => {
      let reject!: (e: unknown) => void;
      let resolve!: () => void;
      const onSelect = vi
        .fn()
        .mockImplementationOnce(() => new Promise<void>((_, r) => (reject = r)))
        .mockImplementationOnce(() => new Promise<void>((r) => (resolve = r)));
      render(
        <RowActions
          actions={[{ key: "del", label: "删除", onSelect, confirm: { title: "确认删除？" } }]}
        />,
      );
      fireEvent.click(screen.getByText("删除"));
      fireEvent.click(screen.getByRole("button", { name: "确定" }));

      await act(async () => {
        reject(new Error("网络错误"));
      });
      // 失败：框还在
      expect(screen.getByText("确认删除？")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "确定" }));
      await act(async () => {
        resolve();
      });
      expect(screen.queryByText("确认删除？")).toBeNull();
      expect(onSelect).toHaveBeenCalledTimes(2);
    });
  });

  it("全部动作都被 hidden 时不渲染空壳（表格里留个空 flex 容器毫无意义）", () => {
    const { container } = render(
      <RowActions actions={[{ key: "a", label: "甲", hidden: true }]} />,
    );
    expect(container.querySelector("div")).toBeNull();
  });

  it("revealOnHover 平时隐去，但无悬浮设备与键盘聚焦时恒显", () => {
    const { container } = render(
      <RowActions revealOnHover actions={[{ key: "a", label: "甲" }]} />,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group.className).toContain("opacity-0");
    expect(group.className).toContain("group-hover/row:opacity-100");
    expect(group.className).toContain("focus-within:opacity-100");
    // 触屏没有悬浮，不恢复的话这一列等于消失
    expect(group.className).toContain("[@media(hover:none)]:opacity-100");
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
