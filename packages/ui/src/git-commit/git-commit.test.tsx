import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GitCommit, shortSha } from "./git-commit";
import { branchTone } from "./branch-tone";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

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
  it("稳定父更新时跳过提交引用子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <GitCommit sha="10577b9aaaa" branch="master" message="fix: 部署回退" author="瑚琏" />
    ));
  });

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

  it("colorBranch 给分支着色（彩色文字 + soft 底）", () => {
    const { getByText } = render(<GitCommit sha="abc1234" branch="feat/sku-g" />);
    const el = getByText("feat/sku-g").closest("span[style]") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.style.color).toContain("--color-");
    expect(el.style.backgroundColor).toContain("color-mix");
  });

  it("colorBranch=false 退回中性文本（无 style 着色）", () => {
    const { getByText } = render(<GitCommit sha="abc1234" branch="main" colorBranch={false} />);
    const el = getByText("main").closest("span[style]");
    expect(el).toBeNull();
  });
});

describe("branchTone", () => {
  it("主干分支 → success", () => {
    expect(branchTone("main")).toBe("success");
    expect(branchTone("master")).toBe("success");
    expect(branchTone("release/1.2")).toBe("success");
  });

  it("约定式前缀固定取色", () => {
    expect(branchTone("feat/sku-g")).toBe("chart-1");
    expect(branchTone("fix/checkout")).toBe("warning");
    expect(branchTone("perf/render")).toBe("chart-4");
    expect(branchTone("hotfix/oom")).toBe("danger");
  });

  it("未知分支按名称稳定哈希落到 chart-1..6", () => {
    const a = branchTone("zhangsan/spike");
    const b = branchTone("zhangsan/spike");
    expect(a).toBe(b);
    expect(a).toMatch(/^chart-[1-6]$/);
  });
});
