import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    pipelineAria: "论文生产流水线：从选题到发表的七个阶段，以及每个阶段中的论文",
    paperCount: "{0} 篇",
    revisionLoop: "修改意见回流",
    topicDesc: "(a) 选题：明确研究问题与目标期刊，建立稿件。",
    surveyDesc: "(b) 文献调研：在文献库里收集、标注并引用相关工作。",
    draftingDesc: "(c) 撰写：按章节写正文，章节号与交叉引用自动维护。",
    figuresDesc: "(d) 作图：在图表工坊里把流程图拆成可逐步讲解的步骤。",
    reviewDesc: "(e) 内审：导师与合作者逐条批注，意见回流到撰写阶段。",
    submissionDesc: "(f) 投稿：格式检查、打印分图、导出矢量图并提交。",
    publishedDesc: "(g) 已发表：归档终稿与全部图表。",
    overview: "全部阶段与当前在制的论文。",
    caption: "论文生产流水线：每个阶段下挂着正处于该阶段的论文。",
  },
  en: {
    pipelineAria: "Paper production pipeline: seven stages from topic to publication and the papers in each stage",
    paperCount: "{0} papers",
    revisionLoop: "revision loop",
    topicDesc: "(a) Topic: define the research question and the target venue, and create the manuscript.",
    surveyDesc: "(b) Survey: collect, annotate and cite related work in the library.",
    draftingDesc: "(c) Drafting: write section by section; section numbers and cross references stay in sync.",
    figuresDesc: "(d) Figures: split flow figures into steps in the figure studio.",
    reviewDesc: "(e) Review: advisors and co-authors comment line by line, and comments flow back to drafting.",
    submissionDesc: "(f) Submission: check the format, print sub-figures, export vector figures and submit.",
    publishedDesc: "(g) Published: archive the final version and every figure.",
    overview: "All stages with the papers currently in progress.",
    caption: "The paper production pipeline: each stage lists the papers currently in it.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-pipeline-figure",
  content: t(content),
};

export default dictionary;
