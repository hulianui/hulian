import { describe, expect, it } from "vitest";

import { content as liveRoomContent } from "./live/_components/room/room-view.content";
import { ORDER_STATUS_LABELS } from "./mobile/_data/orders";
import * as mobileServices from "./mobile/_data/services";
import { content as mobileServicesContent } from "./mobile/_data/services.content";
import { content as personalProfileContent } from "./personal/_data/profile.content";
import { WORK_STATUS_LABELS } from "./personal/_data/works";
import { content as websiteHeroContent } from "./website/_components/sections/hero.content";
import { content as websitePricingCardsContent } from "./website/_components/pricing-cards.content";
import { content as websiteSiteContent } from "./website/_data/site.content";

const englishIt = process.env.DOCS_LOCALE === "en" ? it : it.skip;
const { SERVICE_CATEGORY_LABELS, services } = mobileServices;

describe("Task 12 English fixture quality", () => {
  it("keeps representative product copy specific and natural", () => {
    expect(liveRoomContent.en.askSupportAboutSizingOffersOrDelivery).toBe(
      "Ask support about sizing, offers, or delivery...",
    );
    expect(mobileServicesContent.en.deepWholeHomeCleaning).toBe("Deep whole-home cleaning");
    expect(personalProfileContent.en.iBuildThingsIWantToUse).toBe(
      "I build things I want to use.",
    );
    expect(websiteHeroContent.en.sendTheApplication).toBe("Ship your app to the");
  });

  englishIt("preserves canonical domain values while exposing English labels", () => {
    expect(SERVICE_CATEGORY_LABELS["家政保洁"]).toBe("Home cleaning");
    expect(ORDER_STATUS_LABELS["待确认"]).toBe("Pending confirmation");
    expect(WORK_STATUS_LABELS["在线"]).toBe("Online");
  });

  englishIt("keeps mobile tag protocol IDs stable and preserves every intended tone", () => {
    expect(services.map((service) => service.tag)).toEqual([
      "bestseller",
      "topRated",
      "popular",
      "urgentRepair",
      "movingIncluded",
      "fastArrival",
      "warranty",
      "greatValue",
    ]);
    expect(mobileServices).toHaveProperty("SERVICE_TAG_TONES");
    expect(mobileServices.SERVICE_TAG_TONES).toEqual({
      bestseller: "danger",
      topRated: "success",
      popular: "warning",
      urgentRepair: "danger",
      movingIncluded: "neutral",
      fastArrival: "danger",
      warranty: "success",
      greatValue: "warning",
    });
    expect(mobileServices).toHaveProperty("SERVICE_TAG_LABELS");
    const tagLabels = mobileServices.SERVICE_TAG_LABELS;
    expect(services.map((service) => tagLabels[service.tag])).toEqual([
      "Bestseller",
      "Top rated",
      "Popular",
      "Urgent repair",
      "Moving included",
      "Fast arrival",
      "Warranty",
      "Great value",
    ]);
  });

  englishIt("renders localized category labels inside every mobile SVG cover", () => {
    for (const service of services) {
      const svg = decodeURIComponent(service.cover.slice(service.cover.indexOf(",") + 1));
      expect(svg).toContain(`>${SERVICE_CATEGORY_LABELS[service.category]}</text>`);
      expect(svg).not.toMatch(/[\p{Script=Han}\u3000-\u303F\uFE10-\uFE1F\uFE30-\uFE4F\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65]/u);
    }
  });

  it("uses the correct English name for the Chinese MLPS Level 3 standard", () => {
    expect(websiteSiteContent.en.soc2ClassIiiCompliance).toBe(
      "SOC 2 / MLPS Level 3 compliance",
    );
    expect(websitePricingCardsContent.en.soc2ClassIiiCompliance).toBe(
      "SOC 2 / MLPS Level 3 compliance",
    );
  });

  it("rejects CJK and known literal-translation phrasing in representative catalogs", () => {
    const english = [
      ...Object.values(liveRoomContent.en),
      ...Object.values(mobileServicesContent.en),
      ...Object.values(personalProfileContent.en),
      ...Object.values(websiteHeroContent.en),
    ].join("\n");

    expect(english).not.toMatch(/\p{Script=Han}/u);
    expect(english).not.toMatch(/send the application|click here|please input/i);
  });
});
