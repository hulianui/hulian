import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { IconPicker } from "./icon-picker";
import type { IconPickerSource } from "./icon-picker.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const renderIcon = (name: string) => <svg data-icon={name} />;

const SOURCES: IconPickerSource[] = [
  {
    key: "common",
    label: "常用",
    icons: [
      { name: "home", keywords: ["首页"] },
      { name: "user", keywords: ["用户"] },
    ],
    renderIcon,
  },
  {
    key: "action",
    label: "操作",
    icons: [{ name: "trash", keywords: ["删除"] }, { name: "plus" }],
    renderIcon,
  },
];

describe("IconPicker", () => {
  it("稳定父更新时跳过 IconPicker 子树", async () => {
    // sources 走模块级常量（消费方的常规写法），引用稳定才谈得上 bailout
    await expectMemoSkipsSubtree(() => <IconPicker sources={SOURCES} defaultValue="home" />);
  });

  it("默认渲染第一个分类的图标", () => {
    render(<IconPicker sources={SOURCES} />);
    expect(screen.getByRole("button", { name: "home" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "trash" })).toBeNull();
  });

  it("切分类换网格", () => {
    render(<IconPicker sources={SOURCES} />);
    fireEvent.click(screen.getByText("操作"));
    expect(screen.getByRole("button", { name: "trash" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "home" })).toBeNull();
  });

  it("点图标提交图标名", () => {
    const onValueChange = vi.fn();
    render(<IconPicker sources={SOURCES} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "user" }));
    expect(onValueChange).toHaveBeenCalledWith("user");
  });

  it("选中项标 aria-pressed", () => {
    render(<IconPicker sources={SOURCES} defaultValue="home" />);
    expect(screen.getByRole("button", { name: "home" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "user" }).getAttribute("aria-pressed")).toBe("false");
  });

  describe("搜索", () => {
    it("跨全部分类搜，不只搜当前分类", () => {
      render(<IconPicker sources={SOURCES} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "trash" } });
      // trash 属于第二个分类，当前停在第一个
      expect(screen.getByRole("button", { name: "trash" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: "home" })).toBeNull();
    });

    it("认 keywords 中文别名", () => {
      render(<IconPicker sources={SOURCES} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "删除" } });
      expect(screen.getByRole("button", { name: "trash" })).toBeTruthy();
    });

    it("搜索时隐藏分类页签", () => {
      render(<IconPicker sources={SOURCES} />);
      expect(screen.getByText("操作")).toBeTruthy();
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "home" } });
      expect(screen.queryByText("操作")).toBeNull();
    });

    it("无结果出空文案", () => {
      render(<IconPicker sources={SOURCES} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "zzz" } });
      expect(screen.getByText("没有匹配的图标")).toBeTruthy();
    });

    it("searchable={false} 不渲染搜索框", () => {
      render(<IconPicker sources={SOURCES} searchable={false} />);
      expect(screen.queryByRole("textbox")).toBeNull();
    });
  });

  describe("清除", () => {
    it("有值时出当前值行与清除按钮，点了回传 null", () => {
      const onValueChange = vi.fn();
      render(<IconPicker sources={SOURCES} defaultValue="home" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "清除" }));
      expect(onValueChange).toHaveBeenCalledWith(null);
    });

    it("无值时不出清除按钮", () => {
      render(<IconPicker sources={SOURCES} />);
      expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
    });

    it("clearable={false} 不出清除按钮", () => {
      render(<IconPicker sources={SOURCES} defaultValue="home" clearable={false} />);
      expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
    });
  });

  describe("最近使用", () => {
    it("选过之后出现在最近使用区", () => {
      render(<IconPicker sources={SOURCES} />);
      expect(screen.queryByText("最近使用")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "user" }));
      expect(screen.getByText("最近使用")).toBeTruthy();
      // 最近区 + 分类网格各一个同名按钮
      expect(screen.getAllByRole("button", { name: "user" })).toHaveLength(2);
    });

    it("受控 recent 时不自己维护，只回调", () => {
      const onRecentChange = vi.fn();
      render(<IconPicker sources={SOURCES} recent={[]} onRecentChange={onRecentChange} />);
      fireEvent.click(screen.getByRole("button", { name: "user" }));
      expect(onRecentChange).toHaveBeenCalledWith(["user"]);
      // 外部没回填 → 最近区仍不出现
      expect(screen.queryByText("最近使用")).toBeNull();
    });

    it("最近使用里解不出来源的名字被跳过（图标已从 sources 下掉）", () => {
      render(<IconPicker sources={SOURCES} recent={["home", "已下线的图标"]} />);
      expect(screen.getAllByRole("button", { name: "home" })).toHaveLength(2);
      expect(screen.queryByRole("button", { name: "已下线的图标" })).toBeNull();
    });
  });

  it("单个来源时不渲染分类页签", () => {
    render(<IconPicker sources={[SOURCES[0]]} />);
    expect(screen.queryByText("常用")).toBeNull();
  });

  it("受控：不回填 value 则选中态不变", () => {
    const onValueChange = vi.fn();
    render(<IconPicker sources={SOURCES} value="home" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "user" }));
    expect(onValueChange).toHaveBeenCalledWith("user");
    expect(screen.getByRole("button", { name: "home" }).getAttribute("aria-pressed")).toBe("true");
  });
});
