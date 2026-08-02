import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "fileByFileAiReview": "逐文件 AI 审查",
    "prEntersAndAutomaticallyReviewsEachFile": "PR 进来自动逐文件审，行内批注问题",
    "intelligentModelSelection": "智能选模型",
    "assignTheMostSuitableModelBasedOn": "按文件复杂度与成本派给最合适的模型",
    "qualityAccessControl": "质量门禁",
    "scoresSeriousIssuesAndCoverageRatesAre": "分数/严重问题/覆盖率不达标自动阻断合并",
    "coral": "瑚",
    "hanreviewHanreview": "瀚审 HanReview",
    "seniorReviewers": "把资深 reviewer",
    "eyeScaling": "的眼睛规模化",
    "eachPrIsReviewedAndAiReviewers": "每个 PR 进来，AI 审查员逐文件审查、行内批注、给质量分、跑质量门禁，决定能否合并。",
    "hulianBuiltInExample": "© 2026 瑚琏 Hulian · 内置示例",
    "coral2": "瑚",
    "hanreviewHanreview2": "瀚审 HanReview",
    "logInToEnterTheCodeReview": "登录进入代码审查质检台",
    "forgotThePassword": "忘记密码",
    "connectToYourWarehouse": "接入你的仓库",
    "demoEnvironmentLogInByEnteringAny": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "fileByFileAiReview": "File-by-file AI review",
    "prEntersAndAutomaticallyReviewsEachFile": "PR enters and automatically reviews each file, with in-line annotations",
    "intelligentModelSelection": "Intelligent model selection",
    "assignTheMostSuitableModelBasedOn": "Assign the most suitable model based on file complexity and cost",
    "qualityAccessControl": "Quality gate",
    "scoresSeriousIssuesAndCoverageRatesAre": "Scores, serious issues, and coverage rates are not met, automatically blocking merging",
    "coral": "Coral",
    "hanreviewHanreview": "HanReview HanReview",
    "seniorReviewers": "Senior reviewers",
    "eyeScaling": "Eye scaling",
    "eachPrIsReviewedAndAiReviewers": "Each PR is reviewed, and AI reviewers review documents one by one, annotate within the industry, assign quality scores, and run quality access checks to decide whether to merge them.",
    "hulianBuiltInExample": "© 2026 Hulian · Built-in example",
    "coral2": "Coral",
    "hanreviewHanreview2": "HanReview HanReview",
    "logInToEnterTheCodeReview": "Log in to enter the code review review console",
    "forgotThePassword": "Forgot the password",
    "connectToYourWarehouse": "Connect your repository",
    "demoEnvironmentLogInByEnteringAny": "Demo environment: Log in by entering any username or password",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-login-page",
  content: t(content),
};

export default dictionary;
