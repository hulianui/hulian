import { copy } from "./content.content";
import type { LiveProduct, Streamer } from "./types";

export const STREAMER: Streamer = {
  name: copy("hanselectHostAnan"),
  fans: "28.6w",
  meta: copy("text286kFollowers326Streams"),
};

/** 弹幕 / 公屏文案池。 */
export const DANMAKU_POOL = [
  copy("theHostIsAmazing"),
  copy("doesThisJacketComeInPlusSizes"),
  copy("pleaseShareProduct3"),
  copy("canThePriceGoAnyLower"),
  copy("orderedWaitingForDelivery"),
  copy("isTheFabricPureCotton"),
  copy("firstTimeInTheStream"),
  copy("fanBadgeSupport"),
  copy("frontrowviewer"),
  copy("theHostSoundsGreat"),
  copy("thisIsAGreatDeal"),
  copy("waitingToSeeTheFit"),
  copy("isShippingFree"),
  copy("iBoughtThisBeforeGreatQuality"),
  copy("whenWillItShip"),
  copy("howManyColorsAreThere"),
  copy("likedFollowedAndShared"),
  copy("canIGetACoupon"),
  copy("tellUsAboutTheInsulatedBottle"),
  copy("justOrdered"),
];

/** 提问类弹幕（触发 AI 答弹幕草稿）。 */
export const QUESTION_POOL = [
  copy("isThisAvailableInXl"),
  copy("howManyMillilitersDoesTheBottleHold"),
  copy("howLongDoTheHeadphonesLast"),
  copy("canTheAmbientLightChangeColors"),
  copy("doesTheJacketShed"),
  copy("whenWillItShip2"),
  copy("doYouOfferSevenDayReturns"),
];

export const VIEWER_NAMES = [
  copy("abai"), "momo", copy("nightvoyager"), copy("deer"), "Kris", copy("doudoudragon"), copy("titmouse"), copy("seabreeze"), copy("ananfan"),
  copy("colanoice"), copy("eveningbreeze"), copy("sunflower"), copy("returningcustomerzhang"), copy("techfan"), copy("savvyshopper"), copy("xixi"),
  copy("bigspender"), copy("icecream"), copy("chestnut"), copy("azhou"),
];

export const GIFTS = [
  { name: copy("heart"), icon: "💖", color: "var(--color-chart-1)" },
  { name: copy("lollipop"), icon: "🍭", color: "var(--color-chart-3)" },
  { name: copy("rocket"), icon: "🚀", color: "var(--color-chart-2)" },
  { name: copy("sportsCar"), icon: "🏎️", color: "var(--color-chart-4)" },
  { name: copy("castle"), icon: "🏰", color: "var(--color-chart-1)" },
];

/** 互动栏可送礼物（C 端面板）。 */
export const GIFT_PANEL = GIFTS.map((g, i) => ({ ...g, coins: [1, 9, 66, 188, 520][i] }));

/** 本地内联渐变图（零外链，过门禁）。 */
export function productImage(hue: number): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 62% 68%)"/><stop offset="1" stop-color="hsl(${hue + 38} 58% 50%)"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/></svg>`,
  )}`;
}

export const PRODUCTS: LiveProduct[] = [
  { id: "p1", index: 1, title: copy("unisexHeavyweightWinterSherpaJacketLiveExclusivePrice"), image: productImage(18), price: 129, originalPrice: 399, stock: 86, sold: 1240, tag: copy("flashSale"), explaining: true },
  { id: "p2", index: 2, title: copy("text500MlPortable316StainlessSteelInsulatedBottle"), image: productImage(200), price: 49.9, originalPrice: 99, stock: 320, sold: 3580 },
  { id: "p3", index: 3, title: copy("wirelessAncHeadphonesWith30HourBatteryLife"), image: productImage(140), price: 199, originalPrice: 499, stock: 58, sold: 920, tag: copy("limited") },
  { id: "p4", index: 4, title: copy("desktopRgbSmartAmbientLightWithAppControls"), image: productImage(280), price: 69, originalPrice: 159, stock: 210, sold: 460 },
  { id: "p5", index: 5, title: copy("fourPieceAntibacterialCottonBeddingSetForA18MBed"), image: productImage(96), price: 159, originalPrice: 359, stock: 140, sold: 1760 },
  { id: "p6", index: 6, title: copy("flickerFreeAaRatedDeskLampWithThreeColorTemperatures"), image: productImage(46), price: 89, originalPrice: 219, stock: 96, sold: 640 },
];

/** AI 答弹幕草稿模板（按问题关键词命中）。 */
export const AI_REPLIES: { match: RegExp; reply: string }[] = [
  { match: /码|大小|尺|\b(size|sizes|xl|xxl)\b/i, reply: copy("thisStyleComesInSizesSXxlOpenProduct1ForTheSizeChartAndChooseYourUsualSize") },
  { match: /保温|毫升|容量|\b(ml|milliliter|milliliters|bottle|insulated)\b/i, reply: copy("product2Holds500MlUsesAFoodGrade316StainlessSteelLinerAndStaysAt58CAfterSixHours") },
  { match: /续航|耳机|降噪|\b(headphones?|battery|anc|noise cancellation)\b/i, reply: copy("product3LastsEightHoursPerChargeAnd30HoursWithTheCaseWithUpTo42DbOfActiveNoiseCancellation") },
  { match: /灯|调色|氛围|\b(light|lights|color|colors|ambient)\b/i, reply: copy("product4Supports16MillionAppControlledColorsAndMusicSyncOrderTonightToReceiveARemoteControl") },
  { match: /发货|什么时候|\b(ship|ships|shipping|delivery|deliver)\b/i, reply: copy("ordersPlacedTonightShipWithin48HoursJiangsuZhejiangAndShanghaiReceiveNextDayDeliveryRemoteAreasM") },
  { match: /无理由|退|换|\b(return|returns|exchange|refund)\b/i, reply: copy("everyItemIncludesSevenDayReturnsAndShippingInsuranceSoYouCanOrderWithConfidence") },
];

export const DEFAULT_REPLY = copy("iSawYourQuestionTheHostWillAnswerItOnAirShortly");

/** AI 提词 / 运营提醒池。 */
export const AI_TIPS = [
  copy("viewershipIsRecoveringOfferAStackableLimitedTimeCouponForProduct1ToConvertTheNewTraffic"),
  copy("deliveryQuestionsAreIncreasingInChatStateTheShippingTimeframeOnAirToReduceUncertainty"),
  copy("product3HasStrongWatchTimeButLowConversionAddAQuickBatteryLifeComparisonWithCompetitors"),
  copy("engagementIsFallingACommentToEnterGiveawayCouldImproveRetention"),
  copy("newViewersMakeUp41OfTheAudienceRepeatTheGiveawayRules"),
];

export const AI_ACTIONS = [
  { tool: copy("featureProduct1"), text: copy("theSherpaJacketIsNowFeaturedInTheAudienceShoppingPanel") },
  { tool: copy("send70OffCoupons"), text: copy("sent100LimitedTime70OffCouponsToViewersValidForTenMinutes") },
  { tool: copy("pinTopQuestion"), text: copy("pinnedThePlusSizeQuestionForTheHostToAnswerForEveryone") },
  { tool: copy("startGiveaway"), text: copy("startedTheFollowToEnterFreeOrderGiveawayTheWinnerIsDrawnIn60Seconds") },
];
