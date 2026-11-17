import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    roleAdvisor: "导师",
    roleCoauthor: "合作者",
    roleExternal: "外审专家",
    externalReviewer: "外审专家 A",
    mergeParentsBody: "M 看不出有两个父提交，读者容易以为这是一次快进。建议把 F2 → M 的边画得更明显。",
    mergeParentsReply: "已改：M 改为双圈，两条入边在讲到这一步时都加了流动虚线。",
    shaImpactBody: "应说明 SHA-1 碰撞对 Git 的实际影响：选择前缀碰撞的代价、Git 的碰撞检测，否则读者会误以为仓库已不安全。",
    packSourceBody: "这是示意模型，请在图注里写明，并给出参数的来源，避免被当成实测数据。",
    packSourceReply: "图注已注明「示意模型」，参数含义见公式 (2)。",
    rebaseOntoBody: "可以补一段 git rebase --onto 的用法：只搬运一段提交时它比交互式变基更直接。",
    termBody: "「暂存区」和「索引」混用，建议首次出现时写成「暂存区（索引）」，之后统一。",
    restoreBody: "箭头同时指向暂存区与工作区，但 restore 默认只还原工作区，--staged 才动索引。说明里应区分 restore 与 switch。",
  },
  en: {
    roleAdvisor: "Advisor",
    roleCoauthor: "Co-author",
    roleExternal: "External reviewer",
    externalReviewer: "Reviewer A",
    mergeParentsBody: "It is not obvious that M has two parents; readers may take it for a fast-forward. Please make the F2 → M edge stand out.",
    mergeParentsReply: "Done: M is now a double circle, and both incoming edges get the flowing dash at this step.",
    shaImpactBody: "Please explain the practical impact of SHA-1 collisions on Git, including the cost of chosen-prefix collisions and Git's collision detection. Otherwise readers may assume repositories are no longer safe.",
    packSourceBody: "This is an illustrative model. Say so in the caption and give the origin of the parameters so it is not read as measured data.",
    packSourceReply: "The caption now says illustrative model, and Eq. (2) explains the parameters.",
    rebaseOntoBody: "Consider a paragraph on git rebase --onto: it is more direct than an interactive rebase when moving only a range of commits.",
    termBody: "Staging area and index are used interchangeably. Introduce the term once as staging area (index) and use it consistently afterwards.",
    restoreBody: "The arrows point at both the index and the working tree, but restore only touches the working tree unless --staged is given. Distinguish restore from switch in the description.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-data-reviews",
  content: t(content),
};

export default dictionary;
