import { describe, it, expect } from "vitest";
import {
  BUILTIN_ISSUE_TEMPLATES,
  GITHUB_URL_MAX_LENGTH,
  buildIssueUrl,
  createIssueDraft,
  isUrlTooLong,
  issueSection,
  normalizeRepo,
  renderIssueMarkdown,
} from "./issue-reporter.core";
import type { IssueTemplate } from "./issue-reporter.types";

const bug = BUILTIN_ISSUE_TEMPLATES[0]!;
const feature = BUILTIN_ISSUE_TEMPLATES[1]!;
const enhancement = BUILTIN_ISSUE_TEMPLATES[2]!;

describe("issueSection", () => {
  it("正文非空 → 产出二级章节", () => {
    expect(issueSection("现状", "点了没反应")).toBe("## 现状\n\n点了没反应");
  });
  it("正文为空/纯空白/undefined → 整节不产出", () => {
    expect(issueSection("现状", "")).toBe("");
    expect(issueSection("现状", "   \n  ")).toBe("");
    expect(issueSection("现状", undefined)).toBe("");
  });
});

describe("normalizeRepo", () => {
  it("owner/repo 原样", () => expect(normalizeRepo("hulianui/hulian")).toBe("hulianui/hulian"));
  it("完整 URL → owner/repo", () =>
    expect(normalizeRepo("https://github.com/hulianui/hulian")).toBe("hulianui/hulian"));
  it("去掉 .git 与首尾斜杠", () =>
    expect(normalizeRepo(" /hulianui/hulian.git/ ")).toBe("hulianui/hulian"));
});

describe("renderIssueMarkdown · bug 模板", () => {
  it("字段齐全 → 各章节按序产出", () => {
    const md = renderIssueMarkdown(
      {
        type: "bug",
        title: "Select 清不掉",
        relatedComponent: "select",
        values: {
          summary: "clearable 点了没反应",
          steps: "1. 打开\n2. 点 ×",
          expected: "清空",
          actual: "值还在",
          env: "0.25.2",
        },
      },
      bug,
    );
    expect(md).toContain("## 相关组件\n\n`select`");
    expect(md).toContain("## 问题描述\n\nclearable 点了没反应");
    expect(md).toContain("## 复现步骤");
    expect(md).toContain("## 环境\n\n0.25.2");
    // 相关组件在最前
    expect(md.indexOf("## 相关组件")).toBeLessThan(md.indexOf("## 问题描述"));
  });

  it("字段为空 → 不产出空章节", () => {
    const md = renderIssueMarkdown(
      { type: "bug", title: "t", values: { summary: "只有描述" } },
      bug,
    );
    expect(md).toBe("## 问题描述\n\n只有描述");
    expect(md).not.toContain("## 复现步骤");
    expect(md).not.toContain("## 相关组件");
    expect(md).not.toContain("## 环境");
  });
});

describe("renderIssueMarkdown · feature 模板", () => {
  it("期望 API 自动包 tsx 代码围栏", () => {
    const md = renderIssueMarkdown(
      { type: "feature", title: "t", values: { problem: "缺件", api: "<Foo bar />" } },
      feature,
    );
    expect(md).toContain("## 需求描述\n\n缺件");
    expect(md).toContain("## 期望 API\n\n```tsx\n<Foo bar />\n```");
  });

  it("期望 API 为空 → 连围栏带章节一起不产出", () => {
    const md = renderIssueMarkdown(
      { type: "feature", title: "t", values: { problem: "缺件", api: "  " } },
      feature,
    );
    expect(md).not.toContain("```");
    expect(md).not.toContain("## 期望 API");
  });
});

describe("renderIssueMarkdown · enhancement 模板", () => {
  it("三节齐全", () => {
    const md = renderIssueMarkdown(
      {
        type: "enhancement",
        title: "t",
        values: { current: "太慢", improvement: "加缓存", impact: "无破坏" },
      },
      enhancement,
    );
    expect(md).toBe("## 现状\n\n太慢\n\n## 期望改进\n\n加缓存\n\n## 影响面与兼容性\n\n无破坏");
  });

  it("全空 → 空串（不留一行空白骨架）", () => {
    expect(renderIssueMarkdown({ type: "enhancement", title: "t", values: {} }, enhancement)).toBe(
      "",
    );
  });
});

describe("自定义模板", () => {
  const custom: IssueTemplate = {
    type: "docs",
    label: "文档",
    labels: ["documentation"],
    fields: [{ name: "page", label: "页面" }],
    toMarkdown: (values) => `页面：${values.page ?? ""}`,
  };
  it("toMarkdown 完全由模板说了算", () => {
    expect(
      renderIssueMarkdown({ type: "docs", title: "t", values: { page: "/select" } }, custom),
    ).toBe("页面：/select");
  });
  it("createIssueDraft 缺省 labels 取模板的", () => {
    const draft = createIssueDraft({ type: "docs", title: " 标题 ", values: {} }, custom);
    expect(draft.labels).toEqual(["documentation"]);
    expect(draft.title).toBe("标题");
  });
});

describe("buildIssueUrl", () => {
  const draft = createIssueDraft({ type: "bug", title: "标题", values: { summary: "正文" } }, bug);

  it("中文标题按 UTF-8 百分号编码", () => {
    const url = buildIssueUrl(draft, "hulianui/hulian");
    expect(url.startsWith("https://github.com/hulianui/hulian/issues/new?")).toBe(true);
    expect(url).toContain(`title=${encodeURIComponent("标题")}`);
    expect(url).toContain("title=%E6%A0%87%E9%A2%98");
  });

  it("换行编码为 %0A（不是 + 也不是裸换行）", () => {
    const d = createIssueDraft({ type: "bug", title: "t", values: { summary: "一\n二" } }, bug);
    const url = buildIssueUrl(d, "hulianui/hulian");
    expect(url).toContain("%0A");
    expect(url).not.toContain("\n");
  });

  it("空格编码为 %20 而非 +（避免接收端按 form-urlencoded 还原歧义）", () => {
    const d = createIssueDraft({ type: "bug", title: "a b", values: {} }, bug);
    expect(buildIssueUrl(d, "hulianui/hulian")).toContain("title=a%20b");
  });

  it("# 与 & 被编码，不会截断 query", () => {
    const d = createIssueDraft(
      { type: "bug", title: "#96 & more", values: { summary: "见 #96 & #97" } },
      bug,
    );
    const url = buildIssueUrl(d, "hulianui/hulian");
    expect(url).toContain("title=%2396%20%26%20more");
    expect(url).toContain("%23");
    expect(url).toContain("%26");
    // query 部分只应有我们自己拼的分隔符
    const query = url.split("?")[1]!;
    expect(query.split("&").length).toBe(3); // title / body / labels
  });

  it("labels 逗号拼接；无 labels 时不带该参数", () => {
    expect(buildIssueUrl(draft, "hulianui/hulian")).toContain("labels=bug");
    const noLabel = { ...draft, labels: [] };
    expect(buildIssueUrl(noLabel, "hulianui/hulian")).not.toContain("labels=");
  });

  it("repo 传完整 URL 也能拼对", () => {
    expect(buildIssueUrl(draft, "https://github.com/hulianui/hulian")).toContain(
      "https://github.com/hulianui/hulian/issues/new?",
    );
  });
});

describe("isUrlTooLong", () => {
  it("默认阈值 8000", () => expect(GITHUB_URL_MAX_LENGTH).toBe(8000));
  it("短 URL 不算超长", () =>
    expect(isUrlTooLong("https://github.com/a/b/issues/new?title=x")).toBe(false));
  it("超过阈值算超长", () => expect(isUrlTooLong("x".repeat(8001))).toBe(true));
  it("恰好等于阈值不算超长（边界）", () => expect(isUrlTooLong("x".repeat(8000))).toBe(false));
  it("可自定义阈值", () => expect(isUrlTooLong("x".repeat(11), 10)).toBe(true));

  it("量的是整条 URL 而不是 body —— 长标题也会把额度吃满", () => {
    const d = createIssueDraft({ type: "bug", title: "长".repeat(3000), values: {} }, bug);
    // body 是空的，只有 title 撑长度；按 UTF-8 编码每个汉字 9 字符
    expect(d.body).toBe("");
    expect(isUrlTooLong(buildIssueUrl(d, "hulianui/hulian"))).toBe(true);
  });
});
