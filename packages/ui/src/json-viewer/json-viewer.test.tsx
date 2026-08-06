import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JsonViewer, valueType, jsonPath } from "./json-viewer";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

// 模块级常量：memo 只认引用相等，写成内联字面量每次都是新引用，测试会假红。
const STABLE_DATA = { model: "claude-opus-5", usage: { total_tokens: 170 } };

describe("valueType", () => {
  it("区分 null / array / object 与原始类型", () => {
    expect(valueType(null)).toBe("null");
    expect(valueType([1])).toBe("array");
    expect(valueType({})).toBe("object");
    expect(valueType("x")).toBe("string");
    expect(valueType(42)).toBe("number");
    expect(valueType(true)).toBe("boolean");
  });
});

describe("jsonPath", () => {
  it("对象用点 数组用方括号", () => {
    expect(jsonPath("$", "model", false)).toBe("$.model");
    expect(jsonPath("$.choices", 0, true)).toBe("$.choices[0]");
  });
});

describe("JsonViewer", () => {
  // 回归护栏：JsonViewer 外层的 memo 一旦被拆掉，本例立刻红。
  it("稳定父更新时跳过 JsonViewer 子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <JsonViewer data={STABLE_DATA} rootName="response" defaultExpandedDepth={1} />
    ));
  });

  it("默认展开根层级显顶层 key", () => {
    const { getByText } = render(<JsonViewer data={{ model: "gpt-5.5", usage: { total: 42 } }} />);
    expect(getByText(/model/)).toBeTruthy();
  });

  it("嵌套对象初始折叠显计数", () => {
    const { getByText } = render(
      <JsonViewer data={{ usage: { a: 1, b: 2 } }} defaultExpandedDepth={0} />,
    );
    expect(getByText(/2 keys/)).toBeTruthy();
  });

  it("数组折叠显 items 计数", () => {
    const { getByText } = render(
      <JsonViewer data={{ choices: [1, 2, 3] }} defaultExpandedDepth={1} />,
    );
    expect(getByText(/3 items/)).toBeTruthy();
  });

  it("点节点展开嵌套显叶子值", () => {
    const { getByText } = render(
      <JsonViewer data={{ usage: { total: 42 } }} defaultExpandedDepth={1} />,
    );
    fireEvent.click(getByText(/usage/));
    expect(getByText("42")).toBeTruthy();
  });

  it("字符串值带引号着色", () => {
    const { getByText } = render(<JsonViewer data={{ model: "gpt-5.5" }} />);
    expect(getByText('"gpt-5.5"')).toBeTruthy();
  });
});
