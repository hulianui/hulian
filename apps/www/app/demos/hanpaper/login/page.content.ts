import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    featureFlowTitle: "动态流程图逐步讲解",
    featureFlowBody: "一张图拆成若干步，读者逐步播放，审稿人能指着第 3 步提意见",
    featureExportTitle: "一键打印分图与逐步导出 SVG",
    featureExportBody: "打印时流程图自动展开为 (a)(b)(c) 分图，每一步都能导出成可编辑的矢量图",
    featureLoopTitle: "文献与审阅闭环",
    featureLoopBody: "文献库、交叉引用与审阅意见挂在同一份稿件上，改完一条关一条",
    brandMark: "文",
    brandName: "瀚文 HanPaper",
    headline: "让论文里的图会动，也能印在纸上",
    subheadline: "从选题、写作、配图到审阅与投稿，在同一个工作坊里把一篇论文做完。",
    footnote: "© 2026 瀚文 HanPaper · 内置示例",
    subtitle: "登录论文工坊",
    usernameLabel: "账号",
    usernamePlaceholder: "邮箱或 ORCID",
    forgotPassword: "忘记密码",
    signInWithOrcid: "用 ORCID 登录",
    demoHint: "演示环境：账号 / 密码任意填写即可登录",
  },
  en: {
    featureFlowTitle: "Step-by-step flow figures",
    featureFlowBody: "Split one figure into steps that readers play through, so reviewers can point at step 3",
    featureExportTitle: "Print sub-figures, export SVG per step",
    featureExportBody: "In print, flow figures unfold into (a)(b)(c) sub-figures, and every step exports as an editable vector file",
    featureLoopTitle: "References and reviews, closed loop",
    featureLoopBody: "The library, cross-references and review comments live on the same manuscript; resolve them one by one",
    brandMark: "H",
    brandName: "HanPaper",
    headline: "Figures that move on screen and still print on paper",
    subheadline: "Take a paper from topic to drafting, figures, review and submission in one workshop.",
    footnote: "© 2026 HanPaper · Built-in demo",
    subtitle: "Sign in to the paper workshop",
    usernameLabel: "Account",
    usernamePlaceholder: "Email or ORCID",
    forgotPassword: "Forgot password",
    signInWithOrcid: "Sign in with ORCID",
    demoHint: "Demo environment: any account and password will sign you in",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-login-page",
  content: t(content),
};

export default dictionary;
