import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./docs-locale", () => ({ DOCS_LOCALE: "en" }));

import { PromptInputBlock } from "../app/blocks/_blocks/prompt-input";
import { translateFixtureProps } from "./fixture-copy";

describe("English fixture presentation copy", () => {
  it("translates only declared presentation fields and preserves controlled data", () => {
    const props = translateFixtureProps({
      children: "保存设置",
      title: "保存设置",
      fallback: "张",
      closeLabel: "关闭",
      avatars: [{ src: "/avatar.png", alt: "成员头像" }],
      grades: [{ min: 0, label: "富余" }],
      search: {
        fields: [{ name: "keyword", label: "关键词", placeholder: "工单标题 / 负责人 / 编号" }],
      },
      value: "未登记的中文输入",
      defaultValue: "默认中文输入",
      id: "中文标识",
      name: "中文名称",
      href: "/中文路径",
      protocol: "中文协议",
    });

    expect(props.children).toBe("Save settings");
    expect(props.title).toBe("Save settings");
    expect(props.fallback).toBe("Zhang");
    expect(props.closeLabel).toBe("Close");
    expect(props.avatars).toEqual([{ src: "/avatar.png", alt: "Member avatar" }]);
    expect(props.grades).toEqual([{ min: 0, label: "surplus" }]);
    expect(props.search).toEqual({
      fields: [{ name: "keyword", label: "keywords", placeholder: "Ticket title / owner / ID" }],
    });
    expect(props.value).toBe("未登记的中文输入");
    expect(props.defaultValue).toBe("默认中文输入");
    expect(props.id).toBe("中文标识");
    expect(props.name).toBe("中文名称");
    expect(props.href).toBe("/中文路径");
    expect(props.protocol).toBe("中文协议");
  });

  it("keeps unregistered Chinese typed into a controlled fixture", () => {
    const { getByPlaceholderText } = render(<PromptInputBlock />);
    const input = getByPlaceholderText("Enter a prompt or choose a suggestion above...") as HTMLTextAreaElement;

    expect(() => fireEvent.change(input, { target: { value: "未登记的中文用户输入" } })).not.toThrow();
    expect(input.value).toBe("未登记的中文用户输入");
  });
});
