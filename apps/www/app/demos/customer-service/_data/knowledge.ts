import { copy } from "./knowledge.content";
import type { KnowledgeArticle } from "./types";

// 知识库文章（markdown body），供坐席检索与详情阅读。
export const articles: KnowledgeArticle[] = [
  {
    id: "KB-01",
    title: copy("returnAndRefundPolicyAndTimelineInstructions"),
    category: copy("afterSales"),
    excerpt: copy("dayNoReasonReturnRangeRefundTime"),
    views: 3820,
    updatedAt: "2026-05-28",
    body: copy("returnAndRefundPolicyScopeOfApplication"),
  },
  {
    id: "KB-02",
    title: copy("logisticsTrackExceptionHandlingProcess"),
    category: copy("logistics"),
    excerpt: copy("standardResponseProceduresForAbnormalReceiptsNo"),
    views: 2640,
    updatedAt: "2026-06-01",
    body: copy("logisticsExceptionHandlingNoTrackUpdateFor"),
  },
  {
    id: "KB-03",
    title: copy("couponStackingAndUsageRules"),
    category: copy("marketing"),
    excerpt: copy("theSuperimpositionLogicOfDiscountCouponsCategory"),
    views: 1980,
    updatedAt: "2026-05-20",
    body: copy("couponRulesOverlayLogicPlatformCouponStore"),
  },
  {
    id: "KB-04",
    title: copy("exclusivePrivilegesForBlackCardGoldCard"),
    category: copy("member"),
    excerpt: copy("listOfBenefitsAtEachLevelExclusive"),
    views: 1520,
    updatedAt: "2026-05-15",
    body: copy("memberRightsLevelDedicatedCustomerServiceFree"),
  },
  {
    id: "KB-05",
    title: copy("accountSecurityAndRemoteLoginVerification"),
    category: copy("accountNumber"),
    excerpt: copy("remoteLoginReminderIdentityVerificationProcessAnd"),
    views: 1130,
    updatedAt: "2026-05-30",
    body: copy("accountSecurityRemoteLoginVerificationConfirmWhether"),
  },
  {
    id: "KB-06",
    title: copy("shoppingGuideSkillsForMaternalAndInfant"),
    category: copy("shoppingGuide"),
    excerpt: copy("professionalRecommendationsForAntiColicBabyBottles"),
    views: 760,
    updatedAt: "2026-05-22",
    body: copy("motherAndBabyShoppingGuideWordsBaby"),
  },
];

export const articleById = (id: string): KnowledgeArticle | undefined =>
  articles.find((a) => a.id === id);

export const KB_CATEGORIES = [copy("all"), copy("afterSales2"), copy("logistics2"), copy("marketing2"), copy("member2"), copy("accountNumber2"), copy("shoppingGuide2")] as const;
