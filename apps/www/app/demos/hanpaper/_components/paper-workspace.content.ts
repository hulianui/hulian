import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    read: "阅读",
    printPreview: "打印预览",
    paperMode: "稿件形态",
    present: "答辩演示",
    printPdf: "打印 / 存为 PDF",
    savedAgo: "已自动保存",
    outline: "目录",
    details: "稿件信息",
    venue: "目标期刊",
    words: "字数",
    figures: "图表",
    references: "参考文献",
    deadline: "截稿",
    deadlineIn: "{0} 天后",
    noDeadline: "未设定",
    progress: "完成度",
    openComments: "{0} 条审阅意见待处理",
    goReview: "去处理",
    figureStudio: "在图表工坊中编辑",
    noManuscriptTitle: "这篇论文还没有在线稿件",
    noManuscriptBody: "稿件仍在本地撰写，上传 LaTeX 或 Word 后即可在这里排版、配图并生成动态流程图。",
    backToWorkbench: "回到工作台",
    openGitPaper: "打开示例稿件",
    printHint: "打印预览下，流程图定格在「全部」并展开为分图，交互控件隐藏。",
  },
  en: {
    read: "Read",
    printPreview: "Print preview",
    paperMode: "Manuscript mode",
    present: "Present",
    printPdf: "Print / save as PDF",
    savedAgo: "Saved automatically",
    outline: "Contents",
    details: "Manuscript",
    venue: "Venue",
    words: "Words",
    figures: "Figures",
    references: "References",
    deadline: "Deadline",
    deadlineIn: "in {0} days",
    noDeadline: "Not set",
    progress: "Progress",
    openComments: "{0} review comments open",
    goReview: "Review",
    figureStudio: "Edit in figure studio",
    noManuscriptTitle: "No online manuscript yet",
    noManuscriptBody: "This paper is still written locally. Upload LaTeX or Word to typeset it here, add figures and build step-by-step flow figures.",
    backToWorkbench: "Back to workbench",
    openGitPaper: "Open the sample manuscript",
    printHint: "In print preview, flow figures freeze on All and unfold into sub-figures; controls are hidden.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-paper-workspace",
  content: t(content),
};

export default dictionary;
