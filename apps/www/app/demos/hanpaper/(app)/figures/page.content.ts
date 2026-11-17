import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pageTitle: "图表工坊",
    pageDescription:
      "论文里的每张流程图都由状态决定画面：正文引用、步骤按钮和打印分图只是同一组预设的不同入口。选中一张图，逐步检查它的讲解顺序，再导出成投稿用的矢量图。",
    figureList: "论文插图",
    figureListHint: "点选一张图，在中间逐步预览。",
    preview: "预览",
    steps: "讲解步骤",
    stepsHint: "点任意一步，预览会切到该步并描边强调；也可以直接使用图下方的控件。",
    jumpToStep: "切到这一步",
    checked: "已检查",
    markChecked: "标记已检查",
    uncheck: "取消检查",
    markedToast: "已标记「{0}」为已检查",
    unmarkedToast: "已取消「{0}」的检查标记",
    openInManuscript: "在稿件中打开",
    printMode: "打印分图",
    readMode: "交互预览",
    paperMode: "预览形态",
    present: "演示全部图表",
    statsFigures: "动态图",
    statsSteps: "讲解步骤",
    statsExports: "可导出状态",
    statsChecked: "已检查",
    captionLabel: "图注",
    chapterLabel: "所在章节",
    idLabel: "图 id",
    stepCount: "{0} 步",
    exportHintTitle: "投稿前",
    exportHintBody:
      "导出的 SVG 用十六进制颜色写成表现属性，不依赖页面 CSS；打印预览会把每张图定格在「全部」并展开分图，和 PDF 里的形态一致。",
    printHint: "打印预览下，图下方控件隐藏，每张图展开为分图。",
    emptyTitle: "还没有动态图",
    emptyBody: "在正文里加入 ProcessFigure 或 PaperFigure 后，这里会自动出现。",
    loadFailedTitle: "图表加载失败",
    retry: "重新加载",
    figureAria: "选定图的预览",
    sectionTrees: "第 3 节 · 三棵树",
    sectionObjects: "第 4 节 · 对象模型",
    sectionBranch: "第 5 节 · 分支与合并",
    sectionRebase: "第 6 节 · 变基",
    sectionPack: "第 7 节 · 打包与增量压缩",
  },
  en: {
    pageTitle: "Figure Studio",
    pageDescription:
      "Every flow figure in the paper is drawn from its state: in-text references, step buttons and print sub-figures are just different doors into the same presets. Pick a figure, check its narrative order step by step, then export submission-ready vectors.",
    figureList: "Paper figures",
    figureListHint: "Pick a figure to preview it step by step in the middle.",
    preview: "Preview",
    steps: "Narrative steps",
    stepsHint: "Pick any step and the preview switches to it with an outline; the controls under the figure work too.",
    jumpToStep: "Switch to this step",
    checked: "Checked",
    markChecked: "Mark checked",
    uncheck: "Uncheck",
    markedToast: "Marked \"{0}\" as checked",
    unmarkedToast: "Removed the check from \"{0}\"",
    openInManuscript: "Open in manuscript",
    printMode: "Print sub-figures",
    readMode: "Interactive",
    paperMode: "Preview mode",
    present: "Present all figures",
    statsFigures: "Flow figures",
    statsSteps: "Steps",
    statsExports: "Exportable states",
    statsChecked: "Checked",
    captionLabel: "Caption",
    chapterLabel: "Section",
    idLabel: "Figure id",
    stepCount: "{0} steps",
    exportHintTitle: "Before submission",
    exportHintBody:
      "Exported SVGs write hex colors as presentation attributes and do not depend on page CSS. Print preview freezes each figure on All and unfolds its sub-figures, matching what the PDF will show.",
    printHint: "In print preview the controls under the figure are hidden and each figure unfolds into sub-figures.",
    emptyTitle: "No flow figures yet",
    emptyBody: "Add a ProcessFigure or PaperFigure to the manuscript and it shows up here automatically.",
    loadFailedTitle: "Could not load the figures",
    retry: "Reload",
    figureAria: "Preview of the selected figure",
    sectionTrees: "Section 3 · The Three Trees",
    sectionObjects: "Section 4 · The Object Model",
    sectionBranch: "Section 5 · Branching and Merging",
    sectionRebase: "Section 6 · Rebasing",
    sectionPack: "Section 7 · Packing and Delta Compression",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-app-figures-page",
  content: t(content),
};

export default dictionary;
