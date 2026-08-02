import { copy } from "./reviews.content";
import type { Review } from "./types";

// 商品评价 mock：覆盖多评分（驱动评分分布 Meter）、追评、晒图。
export const reviews: Review[] = [
  { id: "r1", productId: "p-hs-air", author: copy("windListener"), rating: 5, date: "2026-06-02", spec: copy("obsidianBlackNoiseCancelingPro"), content: copy("theNoiseCancelingIsExcellentICanBarelyHearTheTrainOnMyCommuteBatteryLifeIsJustAsGoodIOnlyChargeT"), likes: 218, withImage: true },
  { id: "r2", productId: "p-hs-air", author: "M*****3", rating: 5, date: "2026-05-28", spec: copy("micaWhiteStandard"), content: copy("theWhiteFinishLooksCleanAndSwitchingBetweenTwoDevicesIsSeamlessForMeetingsAndMusic"), likes: 96 },
  { id: "r3", productId: "p-hs-air", author: copy("techieZhang"), rating: 4, date: "2026-05-20", spec: copy("hazeBlueStandard"), content: copy("overallIMHappyThoughTheFitFeltTightAfterLongSessionsSwitchingToTheSmallerEarTipsHelpedALot"), likes: 41 },
  { id: "r4", productId: "p-hs-air", author: copy("anonymousCustomer"), rating: 5, date: "2026-05-15", spec: copy("obsidianBlackStandard"), content: copy("soundQualityIsNoticeablyBetterThanThePreviousGenerationEspeciallyTheBassSupportRespondedQuicklyT"), likes: 33, withImage: true },
  { id: "r5", productId: "p-hs-air", author: copy("s0"), rating: 3, date: "2026-05-10", spec: copy("micaWhiteStandard"), content: copy("noiseCancelingIsGoodButTheTouchControlsAreALittleTooSensitiveISometimesPausePlaybackWhileFixingM"), likes: 12 },

  { id: "r6", productId: "p-hp-pro", author: copy("photoEnthusiast"), rating: 5, date: "2026-06-03", spec: copy("alpineBlue16Gb512Gb"), content: copy("the1InchSensorMakesARealDifferenceNightShotsAreCleanAndTheTelephotoCapturedSharpConcertPhotos"), likes: 402, withImage: true },
  { id: "r7", productId: "p-hp-pro", author: "Z*****", rating: 5, date: "2026-05-30", spec: copy("midnightBlack12Gb256Gb"), content: copy("theTitaniumFrameFeelsPremiumAndLighterInHandThanExpectedThe100WChargerFillsTheBatteryInAboutHalf"), likes: 187 },
  { id: "r8", productId: "p-hp-pro", author: copy("happyBuyer"), rating: 4, date: "2026-05-26", spec: copy("dawnGold16Gb1Tb"), content: copy("performanceAndCamerasAreExcellentItIsALittleHeavySoFansOfSlimPhonesMayNeedTimeToAdjust"), likes: 64 },

  { id: "r9", productId: "p-hy-serum", author: copy("sensitiveSkinJourney"), rating: 5, date: "2026-06-01", spec: copy("text30MlStandardSingleBottle"), content: copy("afterAMonthMyBlemishMarksHaveFadedAndMySkinToneLooksMoreEvenBestOfAllItDoesnTIrritateMySensitive"), likes: 521, withImage: true },
  { id: "r10", productId: "p-hy-serum", author: copy("iS"), rating: 5, date: "2026-05-22", spec: copy("text50MlLargeBuyOneGetOneGiftSet"), content: copy("aThoughtfulFormulaAtAnEffectiveConcentrationTheTextureIsLightAndAbsorbsQuicklyThisIsMyThirdBottl"), likes: 233 },
  { id: "r11", productId: "p-hy-serum", author: copy("aCustomer"), rating: 4, date: "2026-05-18", spec: copy("text30MlStandardSingleBottle"), content: copy("theGentleFormulaTakesConsistentUseSoItMayFeelSlowIfYouWantInstantResultsItHasBeenReliablyIrritat"), likes: 58 },

  { id: "r12", productId: "p-ho-shoe", author: copy("trailVeteran"), rating: 5, date: "2026-06-02", spec: copy("volcanicRed42"), content: copy("theDeepLugsGripWellEvenOnWetTrailsAndTheResponsiveMidsoleStaysComfortableOverLongDistances"), likes: 145, withImage: true },
  { id: "r13", productId: "p-ho-shoe", author: copy("rC"), rating: 4, date: "2026-05-25", spec: copy("carbonGray41"), content: copy("secureFitThoughIRecommendGoingHalfASizeUpTheyLookGoodEnoughForEverydayCommutingToo"), likes: 67 },

  { id: "r14", productId: "p-hw-nuts", author: copy("wellnessFan"), rating: 5, date: "2026-06-03", spec: copy("giftBox1050G"), content: copy("theDailyPacksAreConvenientTheNutsTasteFreshAndTheIngredientListIsSimpleIAlwaysKeepABoxAtTheOffic"), likes: 301 },
  { id: "r15", productId: "p-hw-nuts", author: "K**8", rating: 5, date: "2026-05-29", spec: copy("text30Packs750G"), content: copy("goodValueAndTheIndividualPacksKeepMoistureOutTheBoxAlsoMakesAPresentableGift"), likes: 88 },
];

export function reviewsOf(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

/** 评分分布（5→1 星各占比），驱动评分分布 Meter。 */
export function ratingDistribution(productId: string): { star: number; count: number }[] {
  const rs = reviewsOf(productId);
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: rs.filter((r) => r.rating === star).length }));
}
