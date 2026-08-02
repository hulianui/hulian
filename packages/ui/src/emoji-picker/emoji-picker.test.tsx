import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { EmojiPicker } from "./emoji-picker";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("EmojiPicker", () => {
  it("默认渲染搜索框与分类页签", () => {
    const { getByLabelText } = render(<EmojiPicker />);
    expect(getByLabelText("搜索表情")).toBeTruthy();
    expect(getByLabelText("笑脸")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS renders English chrome and category labels", () => {
    const { getByLabelText, getByText } = render(
      <ConfigProvider locale={enUS}>
        <EmojiPicker recent={["🔥"]} />
      </ConfigProvider>,
    );
    expect(getByLabelText("Search emoji")).toBeTruthy();
    expect(getByLabelText("Smileys & emotion")).toBeTruthy();
    expect(getByLabelText("Animals & nature")).toBeTruthy();
    expect(getByText("Recently used")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS renders the English empty-search message", () => {
    const { getByLabelText, getByText } = render(
      <ConfigProvider locale={enUS}>
        <EmojiPicker />
      </ConfigProvider>,
    );
    fireEvent.change(getByLabelText("Search emoji"), { target: { value: "zzzxxxqqq" } });
    expect(getByText("No matching emoji")).toBeTruthy();
  });

  it("点击 emoji 触发 onSelect", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<EmojiPicker onSelect={fn} />);
    fireEvent.click(getByLabelText("😀"));
    expect(fn).toHaveBeenCalledWith("😀");
  });

  it("切换分类后展示该类 emoji", () => {
    const { getByLabelText } = render(<EmojiPicker />);
    fireEvent.click(getByLabelText("动物"));
    expect(getByLabelText("🐶")).toBeTruthy();
  });

  it("搜索关键词过滤（中文）", () => {
    const { getByLabelText, queryByLabelText } = render(<EmojiPicker />);
    fireEvent.change(getByLabelText("搜索表情"), { target: { value: "狗" } });
    expect(getByLabelText("🐶")).toBeTruthy();
    // 笑脸类的应被过滤掉
    expect(queryByLabelText("😀")).toBeNull();
  });

  it("搜索英文关键词", () => {
    const { getByLabelText } = render(<EmojiPicker />);
    fireEvent.change(getByLabelText("搜索表情"), { target: { value: "fire" } });
    expect(getByLabelText("🔥")).toBeTruthy();
  });

  it("搜索无结果显示空提示", () => {
    const { getByLabelText, getByText } = render(<EmojiPicker />);
    fireEvent.change(getByLabelText("搜索表情"), { target: { value: "zzzxxxqqq" } });
    expect(getByText("没有匹配的表情")).toBeTruthy();
  });

  it("选过的进入最近使用", () => {
    const { getByLabelText, getAllByLabelText, getByText } = render(<EmojiPicker />);
    fireEvent.click(getByLabelText("😀"));
    // 最近使用区 + 分类区都有 😀 → 至少 2 个
    expect(getAllByLabelText("😀").length).toBeGreaterThanOrEqual(2);
    expect(getByText("最近使用")).toBeTruthy();
  });

  it("searchable=false 不渲染搜索框", () => {
    const { queryByLabelText } = render(<EmojiPicker searchable={false} />);
    expect(queryByLabelText("搜索表情")).toBeNull();
  });

  it("受控 recent 透传展示", () => {
    const { getByText } = render(<EmojiPicker recent={["🔥", "💯"]} />);
    expect(getByText("最近使用")).toBeTruthy();
  });

  it("透传 className", () => {
    const { container } = render(<EmojiPicker className="my-picker" />);
    expect(container.firstElementChild!.classList.contains("my-picker")).toBe(true);
  });
});
