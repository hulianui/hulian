import { describe, expect, it } from "vitest";

import { content as liveRoomContent } from "./live/_components/room/room-view.content";
import { ORDER_STATUS_LABELS } from "./mobile/_data/orders";
import { SERVICE_CATEGORY_LABELS } from "./mobile/_data/services";
import { content as mobileServicesContent } from "./mobile/_data/services.content";
import { content as personalProfileContent } from "./personal/_data/profile.content";
import { WORK_STATUS_LABELS } from "./personal/_data/works";
import { content as websiteHeroContent } from "./website/_components/sections/hero.content";

const englishIt = process.env.DOCS_LOCALE === "en" ? it : it.skip;

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
