import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Mentions } from "./mentions";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import {
  findTrigger,
  insertMention,
  defaultFilter,
  segmentMentions,
} from "./mentions.logic";
import type { MentionOption } from "./mentions.types";

const PEOPLE: MentionOption[] = [
  { value: "u1", label: "Alice", description: "PM" },
  { value: "u2", label: "Albert", description: "Eng" },
  { value: "u3", label: "Bob", description: "QA" },
  { value: "u4", label: "Zoe", description: "休假", disabled: true },
];

// 把文本与光标位置一起灌进 textarea（uncontrolled 路径）。
function type(el: HTMLTextAreaElement, value: string, caret = value.length) {
  fireEvent.change(el, { target: { value, selectionStart: caret, selectionEnd: caret } });
}

describe("findTrigger（纯逻辑）", () => {
  it("行首 @ + 查询", () => {
    expect(findTrigger("@a", 2, "@")).toEqual({ start: 0, query: "a" });
  });
  it("空白之后的 @ 命中，start 指向 @", () => {
    expect(findTrigger("嗨 @bo", 5, "@")).toEqual({ start: 2, query: "bo" });
  });
  it("词中 @（前为非空白）不触发，避免 a@b 邮件误触", () => {
    expect(findTrigger("a@b", 3, "@")).toBeNull();
  });
  it("query 含空白即本次提及结束", () => {
    expect(findTrigger("@a b", 4, "@")).toBeNull();
  });
  it("无 prefix 返回 null", () => {
    expect(findTrigger("hello world", 11, "@")).toBeNull();
  });
  it("多字符触发符", () => {
    expect(findTrigger("@@jo", 4, "@@")).toEqual({ start: 0, query: "jo" });
  });
  it("空查询（刚打出 @）", () => {
    expect(findTrigger("@", 1, "@")).toEqual({ start: 0, query: "" });
  });
});

describe("insertMention（纯逻辑）", () => {
  it("替换 prefix+query → prefix+label+空格，光标落空格后", () => {
    expect(insertMention("@a", 0, 2, "@", "Alice")).toEqual({ value: "@Alice ", caret: 7 });
  });
  it("句中插入保留前后文", () => {
    expect(insertMention("嗨 @bo!", 2, 5, "@", "陈航")).toEqual({ value: "嗨 @陈航 !", caret: 6 });
  });
});

describe("segmentMentions（纯逻辑·高亮分段）", () => {
  it("把 @提及 切成 mention 段、其余为 plain，拼接还原原文", () => {
    const segs = segmentMentions("缺少 @负责人 跟进", "@");
    expect(segs).toEqual([
      { text: "缺少 ", mention: false },
      { text: "@负责人", mention: true },
      { text: " 跟进", mention: false },
    ]);
    expect(segs.map((s) => s.text).join("")).toBe("缺少 @负责人 跟进");
  });
  it("行首 @ 命中；a@b 邮件式不命中", () => {
    expect(segmentMentions("@林晓", "@")).toEqual([{ text: "@林晓", mention: true }]);
    expect(segmentMentions("a@b", "@")).toEqual([{ text: "a@b", mention: false }]);
  });
  it("孤立 prefix（@ 后无字符）不算提及", () => {
    expect(segmentMentions("打个 @ 招呼", "@")).toEqual([{ text: "打个 @ 招呼", mention: false }]);
  });
  it("多个提及 + 多字符触发符", () => {
    const segs = segmentMentions("@@a 和 @@b", "@@");
    expect(segs.filter((s) => s.mention).map((s) => s.text)).toEqual(["@@a", "@@b"]);
  });
  it("空串返回空数组", () => {
    expect(segmentMentions("", "@")).toEqual([]);
  });
  it("紧跟中文标点的提及只着色名字，不吞正文", () => {
    const segs = segmentMentions("收到 @瑚琏，正在排查根因。", "@");
    expect(segs).toEqual([
      { text: "收到 ", mention: false },
      { text: "@瑚琏", mention: true },
      { text: "，正在排查根因。", mention: false },
    ]);
  });
  it("名字内的 _ - . 不视为边界", () => {
    expect(segmentMentions("@john.doe-x_y 提交", "@")).toEqual([
      { text: "@john.doe-x_y", mention: true },
      { text: " 提交", mention: false },
    ]);
  });
});

describe("defaultFilter（纯逻辑）", () => {
  it("大小写不敏感匹配 label 或 value", () => {
    expect(defaultFilter({ label: "Alice", value: "u1" }, "al")).toBe(true);
    expect(defaultFilter({ label: "Alice", value: "u1" }, "u1")).toBe(true);
    expect(defaultFilter({ label: "Alice", value: "u1" }, "zz")).toBe(false);
  });
});

describe("Mentions（组件）", () => {
  it("localizes the suggestions listbox accessible name", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <Mentions options={PEOPLE} />
      </ConfigProvider>,
    );
    type(getByRole("combobox") as HTMLTextAreaElement, "@");
    expect(getByRole("listbox", { name: "Mention suggestions" })).toBeTruthy();
  });

  it("keeps the Chinese accessible-name fallback for legacy component dictionaries", () => {
    const locale = { ...enUS, components: { ...enUS.components!, mentions: undefined } };
    const { getByRole } = render(
      <ConfigProvider locale={locale}>
        <Mentions options={PEOPLE} />
      </ConfigProvider>,
    );
    type(getByRole("combobox") as HTMLTextAreaElement, "@");
    expect(getByRole("listbox", { name: "提及候选" })).toBeTruthy();
  });

  it("渲染 role=combobox 文本域 + 默认收起", () => {
    const { getByRole, queryByRole } = render(<Mentions options={PEOPLE} />);
    const ta = getByRole("combobox") as HTMLTextAreaElement;
    expect(ta.tagName).toBe("TEXTAREA");
    expect(ta.getAttribute("aria-expanded")).toBe("false");
    expect(queryByRole("listbox")).toBeNull();
  });

  it("复用 Textarea 皮肤类", () => {
    const { getByRole } = render(<Mentions options={PEOPLE} />);
    expect((getByRole("combobox") as HTMLElement).className).toContain("border-border");
  });

  it("键入触发符弹出候选浮层", () => {
    const { getByRole, getAllByRole } = render(<Mentions options={PEOPLE} />);
    const ta = getByRole("combobox") as HTMLTextAreaElement;
    type(ta, "@");
    expect(getByRole("listbox")).toBeTruthy();
    // Zoe 禁用但仍在候选里（共 4 条，空查询匹配全部）
    expect(getAllByRole("option")).toHaveLength(4);
    expect(ta.getAttribute("aria-expanded")).toBe("true");
  });

  it("按查询过滤候选", () => {
    const { getByRole, getAllByRole } = render(<Mentions options={PEOPLE} />);
    type(getByRole("combobox") as HTMLTextAreaElement, "@al");
    const opts = getAllByRole("option");
    expect(opts).toHaveLength(2); // Alice / Albert
    expect(opts.map((o) => o.textContent)).toEqual(expect.arrayContaining([expect.stringContaining("Alice")]));
  });

  it("无前置空白的 @ 不弹（a@b）", () => {
    const { getByRole, queryByRole } = render(<Mentions options={PEOPLE} />);
    type(getByRole("combobox") as HTMLTextAreaElement, "a@b");
    expect(queryByRole("listbox")).toBeNull();
  });

  it("onSearch 收到查询串", () => {
    const onSearch = vi.fn();
    const { getByRole } = render(<Mentions options={PEOPLE} onSearch={onSearch} />);
    type(getByRole("combobox") as HTMLTextAreaElement, "@bo");
    expect(onSearch).toHaveBeenLastCalledWith("bo");
  });

  it("点击候选插入 @名字+空格 并回调 onSelect/onChange", () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const { getByRole, getByText } = render(
      <Mentions options={PEOPLE} onChange={onChange} onSelect={onSelect} />,
    );
    type(getByRole("combobox") as HTMLTextAreaElement, "@al", 3);
    fireEvent.mouseDown(getByText("Alice").closest('[role="option"]')!);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "u1" }));
    expect(onChange).toHaveBeenLastCalledWith("@Alice ");
  });

  it("方向键漫游 + aria-activedescendant 虚拟焦点，Enter 选中高亮项", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Mentions options={PEOPLE} onChange={onChange} />);
    const ta = getByRole("combobox") as HTMLTextAreaElement;
    type(ta, "@al", 3); // 候选 Alice(0) / Albert(1)
    expect(ta.getAttribute("aria-activedescendant")).toMatch(/-opt-0$/);
    fireEvent.keyDown(ta, { key: "ArrowDown" });
    expect(ta.getAttribute("aria-activedescendant")).toMatch(/-opt-1$/);
    fireEvent.keyDown(ta, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("@Albert ");
  });

  it("Escape 关闭浮层", () => {
    const { getByRole, queryByRole } = render(<Mentions options={PEOPLE} />);
    const ta = getByRole("combobox") as HTMLTextAreaElement;
    type(ta, "@al", 3);
    expect(queryByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(ta, { key: "Escape" });
    expect(queryByRole("listbox")).toBeNull();
  });

  it("禁用候选点击不插入", () => {
    const onSelect = vi.fn();
    const { getByRole, getByText } = render(<Mentions options={PEOPLE} onSelect={onSelect} />);
    type(getByRole("combobox") as HTMLTextAreaElement, "@zo", 3);
    fireEvent.mouseDown(getByText("Zoe").closest('[role="option"]')!);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("自定义触发符 #", () => {
    const { getByRole } = render(
      <Mentions prefix="#" options={[{ value: "t1", label: "Ticket-1" }]} />,
    );
    const ta = getByRole("combobox") as HTMLTextAreaElement;
    type(ta, "#t");
    expect(getByRole("listbox")).toBeTruthy();
  });
});
