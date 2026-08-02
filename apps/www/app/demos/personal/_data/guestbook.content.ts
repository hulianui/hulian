import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    ajie: "阿杰",
    codeframeSavedMyTechnicalPostsICanFinallyShareCodeScreenshotsWithConfidenceCouldExportsSupportRo: "码尺真的救了我的技术推！现在发代码截图终于不丢人了 🎉 顺便问下导出能加圆角窗口吗？",
    linYu: "林屿",
    alreadyInProgressForTheNextReleaseThanksForTheSupport: "已经在做了，下个版本上 😄 谢谢支持！",
    tideIsTheOnlyFocusAppThatHasStayedOnMyPhoneTheBreathingAnimationIsWonderfullyCalmingPleaseMakeAn: "潮汐是我手机里唯一没被卸载的专注 APP。那个呼吸动效太治愈了，求出 iPad 版！",
    laoChen: "老陈",
    flowctlHasRunInOurCiForSixMonthsAndHasBeenRockSolidTheDocsCouldGoDeeperThoughNewTeammatesFaceALe: "flowctl 在我们团队 CI 里跑了半年，稳得一批。文档可以再细点，新人上手有点门槛。",
    thanksIAmRewritingTheDocsAndWillAddAGettingStartedFromScratchChapter: "收到，文档站正在重写，会补一章「从零开始」。",
    divingCat: "潜水的猫",
    inkbookSLocalFirstApproachResonatesWithMeOwningYourDataMattersAndThe8MbAppSizeIsExcellent: "墨册的本地优先理念深得我心，数据握在自己手里太重要了。8MB 包体是真的香。",
    itIsImpressiveToSeeOnePersonShipSoManyPolishedProductsHowDoYouBalanceProductWorkWithGrowthAsAnIn: "一个人能做出这么多打磨到位的产品，佩服。请问独立开发怎么平衡做产品和做增长？",
    doudou: "豆豆",
    awei: "阿伟",
  },
  en: {
    ajie: "Ajie",
    codeframeSavedMyTechnicalPostsICanFinallyShareCodeScreenshotsWithConfidenceCouldExportsSupportRo: "CodeFrame saved my technical posts. I can finally share code screenshots with confidence 🎉 Could exports support rounded window corners?",
    linYu: "Lin Yu",
    alreadyInProgressForTheNextReleaseThanksForTheSupport: "Already in progress for the next release 😄 Thanks for the support!",
    tideIsTheOnlyFocusAppThatHasStayedOnMyPhoneTheBreathingAnimationIsWonderfullyCalmingPleaseMakeAn: "Tide is the only focus app that has stayed on my phone. The breathing animation is wonderfully calming. Please make an iPad version!",
    laoChen: "Lao Chen",
    flowctlHasRunInOurCiForSixMonthsAndHasBeenRockSolidTheDocsCouldGoDeeperThoughNewTeammatesFaceALe: "flowctl has run in our CI for six months and has been rock solid. The docs could go deeper, though; new teammates face a learning curve.",
    thanksIAmRewritingTheDocsAndWillAddAGettingStartedFromScratchChapter: "Thanks. I am rewriting the docs and will add a Getting Started from Scratch chapter.",
    divingCat: "Diving Cat",
    inkbookSLocalFirstApproachResonatesWithMeOwningYourDataMattersAndThe8MbAppSizeIsExcellent: "Inkbook's local-first approach resonates with me. Owning your data matters, and the 8 MB app size is excellent.",
    itIsImpressiveToSeeOnePersonShipSoManyPolishedProductsHowDoYouBalanceProductWorkWithGrowthAsAnIn: "It is impressive to see one person ship so many polished products. How do you balance product work with growth as an independent developer?",
    doudou: "Doudou",
    awei: "Awei",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-personal-data-guestbook",
  content: t(content),
};

export default dictionary;
