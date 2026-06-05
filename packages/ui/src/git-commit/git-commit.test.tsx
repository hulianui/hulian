import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GitCommit, shortSha } from "./git-commit";

describe("shortSha", () => {
  it("默认截 7 位", () => {
    expect(shortSha("10577b9abc1234")).toBe("10577b9");
  });

  it("可定制位数", () => {
    expect(shortSha("10577b9abc1234", 4)).toBe("1057");
  });

  it("短于目标长度时原样返回", () => {
    expect(shortSha("abc")).toBe("abc");
  });

  it("trim 后再截，length 至少 1", () => {
    expect(shortSha("  deadbeef  ", 0)).toBe("d");
  });
});

describe("GitCommit", () => {
  it("渲染短哈希与提交信息", () => {
    const { getByText } = render(
      <GitCommit sha="10577b9aaaa" message="fix: 部署回退" branch="master" />,
    );
    expect(getByText("10577b9")).toBeTruthy();
    expect(getByText("fix: 部署回退")).toBeTruthy();
    expect(getByText("master")).toBeTruthy();
  });

  it("href 时短哈希成链接", () => {
    const { container } = render(<GitCommit sha="abcdef1234" href="/c/abcdef1234" />);
    const a = container.querySelector("a");
    expect(a).toBeTruthy();
    expect(a?.getAttribute("href")).toBe("/c/abcdef1234");
  });

  it("stacked 布局把信息作主行（title 透传）", () => {
    const { getByTitle } = render(
      <GitCommit sha="abc1234" message="feat: 新增部署列表" layout="stacked" />,
    );
    expect(getByTitle("feat: 新增部署列表")).toBeTruthy();
  });

  it("渲染作者与头像槽", () => {
    const { getByText } = render(
      <GitCommit sha="abc1234" author="瑚琏" avatar={<span data-testid="av" />} />,
    );
    expect(getByText("瑚琏")).toBeTruthy();
  });
});
