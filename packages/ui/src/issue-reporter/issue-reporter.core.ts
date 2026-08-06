import type {
  IssueDraft,
  IssueDraftInput,
  IssueFieldValues,
  IssueTemplate,
} from "./issue-reporter.types";

// issue 草稿的纯逻辑层：模板渲染 + 预填 URL 拼装 + 长度降级判定。
// 全部无 React 依赖，可在服务端 / CLI / 测试里单独用。
//
// 三条不显眼但要紧的决定：
//
// 1. **URL 用 encodeURIComponent 而不是 URLSearchParams**。后者把空格编成 `+`，
//    是否被还原成空格取决于接收端按 form-urlencoded 还是 RFC3986 解析；`%20`
//    在两种解析下都是空格。issue 正文里空格极多，不赌这个。
// 2. **长度上限判的是整条 URL 不是 body**。真正会被截断/报错的是 URL 本身，
//    title 和 labels 也占额度；只量 body 会在长标题时判漏。
// 3. **空字段不产出空章节**。`issueSection` 对空白正文直接返回空串——一份满是
//    「## 复现步骤（空）」的 issue 比没有这些章节更难读。

/**
 * GitHub 预填 URL 的实用长度上限。
 *
 * 不是协议硬限，是实务观测值：超过约 8k 字符后，链接在部分浏览器/代理/邮件客户端里
 * 会被截断，GitHub 侧也可能直接报错。超过就别给「打开 GitHub」这条路。
 */
export const GITHUB_URL_MAX_LENGTH = 8000;

/** 把 `owner/repo`、`https://github.com/owner/repo`、`owner/repo.git` 统一成 `owner/repo`。 */
export function normalizeRepo(repo: string): string {
  // 顺序要紧：先剥首尾斜杠再剥 .git，否则 `owner/repo.git/` 的 `.git` 不在串尾、匹配不上。
  return repo
    .trim()
    .replace(/^https?:\/\/(?:www\.)?github\.com\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.git$/i, "");
}

/**
 * 拼一个 markdown 二级章节；正文为空（或只有空白）时返回空串——**空字段不产出空章节**。
 * 模板的 `toMarkdown` 用它兜底就不必各自写一遍判空。
 */
export function issueSection(heading: string, body: string | undefined | null): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  return `## ${heading}\n\n${text}`;
}

/** 把若干章节按空行拼起来，自动丢掉空章节。 */
function joinSections(sections: Array<string>): string {
  return sections.filter(Boolean).join("\n\n");
}

/** 包一段代码围栏；正文为空时返回空串（供 toMarkdown 里的「期望 API」这类字段用）。 */
function fenced(lang: string, body: string | undefined | null): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

/** 相关组件行：空则整节不出。 */
function relatedComponentSection(values: IssueFieldValues): string {
  const slug = (values.relatedComponent ?? "").trim();
  return slug ? issueSection("相关组件", `\`${slug}\``) : "";
}

/** 内置模板：bug 报障。 */
const bugTemplate: IssueTemplate = {
  type: "bug",
  label: "Bug 报障",
  labels: ["bug"],
  tone: "danger",
  fields: [
    { name: "summary", label: "问题描述", required: true, placeholder: "发生了什么？", rows: 4 },
    { name: "steps", label: "复现步骤", placeholder: "1. …\n2. …\n3. …", rows: 4 },
    { name: "expected", label: "期望结果", rows: 3 },
    { name: "actual", label: "实际结果", rows: 3 },
    { name: "env", label: "环境", control: "input", placeholder: "@hulianui/ui 0.25.2 · Chrome 120 · macOS" },
  ],
  toMarkdown: (values) =>
    joinSections([
      relatedComponentSection(values),
      issueSection("问题描述", values.summary),
      issueSection("复现步骤", values.steps),
      issueSection("期望结果", values.expected),
      issueSection("实际结果", values.actual),
      issueSection("环境", values.env),
    ]),
};

/** 内置模板：新组件 / 新能力。 */
const featureTemplate: IssueTemplate = {
  type: "feature",
  label: "新组件 / 新能力",
  labels: ["enhancement"],
  tone: "brand",
  fields: [
    { name: "problem", label: "需求描述", required: true, placeholder: "要解决的问题，而不是你想到的方案", rows: 4 },
    { name: "api", label: "期望 API", placeholder: "<IssueReporter repo=\"hulianui/hulian\" />", rows: 5 },
    { name: "alternatives", label: "现有替代方案", placeholder: "现在你是怎么绕过去的？", rows: 3 },
    { name: "reference", label: "竞品参照", control: "input", placeholder: "链接或组件名" },
  ],
  toMarkdown: (values) =>
    joinSections([
      relatedComponentSection(values),
      issueSection("需求描述", values.problem),
      issueSection("期望 API", fenced("tsx", values.api)),
      issueSection("现有替代方案", values.alternatives),
      issueSection("竞品参照", values.reference),
    ]),
};

/** 内置模板：既有组件的优化建议。 */
const enhancementTemplate: IssueTemplate = {
  type: "enhancement",
  label: "优化建议",
  labels: ["enhancement"],
  tone: "warning",
  fields: [
    { name: "current", label: "现状", required: true, placeholder: "现在的行为/体验是什么样", rows: 3 },
    { name: "improvement", label: "期望改进", rows: 4 },
    { name: "impact", label: "影响面与兼容性", placeholder: "会不会破坏现有用法？", rows: 3 },
  ],
  toMarkdown: (values) =>
    joinSections([
      relatedComponentSection(values),
      issueSection("现状", values.current),
      issueSection("期望改进", values.improvement),
      issueSection("影响面与兼容性", values.impact),
    ]),
};

/** 内置三套模板：bug 报障 / 新组件 / 优化建议。 */
export const BUILTIN_ISSUE_TEMPLATES: IssueTemplate[] = [
  bugTemplate,
  featureTemplate,
  enhancementTemplate,
];

/**
 * 按模板把字段值渲染成 markdown 正文（纯函数）。
 * `relatedComponent` 作为保留键并进 values 交给模板，模板可自行决定放哪儿。
 */
export function renderIssueMarkdown(draft: IssueDraftInput, template: IssueTemplate): string {
  const values: IssueFieldValues = { ...draft.values };
  if (draft.relatedComponent) values.relatedComponent = draft.relatedComponent;
  return template
    .toMarkdown(values)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 组装完整草稿：算出 body + 归一 labels。 */
export function createIssueDraft(input: IssueDraftInput, template: IssueTemplate): IssueDraft {
  return {
    ...input,
    title: input.title.trim(),
    labels: input.labels ?? template.labels ?? [],
    body: renderIssueMarkdown(input, template),
  };
}

/**
 * 生成 GitHub「新建 issue」预填链接。
 *
 * 这条链接只是**打开一个填好的表单**，不提交任何东西——真正的创建仍由用户在 GitHub 上点确认。
 */
export function buildIssueUrl(draft: IssueDraft, repo: string): string {
  const query = [`title=${encodeURIComponent(draft.title)}`, `body=${encodeURIComponent(draft.body)}`];
  if (draft.labels.length > 0) {
    query.push(`labels=${encodeURIComponent(draft.labels.join(","))}`);
  }
  return `https://github.com/${normalizeRepo(repo)}/issues/new?${query.join("&")}`;
}

/** 预填 URL 是否超长（超长就别给「打开 GitHub」，改让用户复制 markdown 手动粘贴）。 */
export function isUrlTooLong(url: string, limit: number = GITHUB_URL_MAX_LENGTH): boolean {
  return url.length > limit;
}
