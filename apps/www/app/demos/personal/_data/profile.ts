import { copy } from "./profile.content";
// 个人站人设数据（SSoT）—— 虚构独立开发者「林屿」。全中文、零外链。
// 下游：site-shell（品牌/导航）、hero/about/stack/journey/contact sections、work/guestbook 复用社交。

export type SocialKind = "github" | "twitter" | "mail" | "rss" | "dribbble";

export interface Social {
  kind: SocialKind;
  label: string;
  handle: string;
  href: string;
}

export interface Stat {
  /** NumberTicker 目标值 */
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

export interface Skill {
  name: string;
  /** 熟练度 0–100，喂 Meter */
  level: number;
  /** 一句话注脚 */
  note: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface JourneyItem {
  year: string;
  title: string;
  desc: string;
  tone: "primary" | "success" | "default";
}

export const profile = {
  name: copy("linYu"),
  nameEn: "Lin Yu",
  handle: "@linyu",
  /** 角色轮换，喂 WordRotate */
  roles: [copy("fullStackEngineer"), copy("independentDeveloper"), copy("productDesigner"), copy("openSourceMaintainer")],
  tagline: copy("iBuildThingsIWantToUse"),
  /** Hero 副标语，喂 AnimatedGradientText */
  kicker: copy("indieMakerHangzhou"),
  location: copy("hangzhouChina"),
  email: "hi@linyu.dev",
  /** 关于页长文（Prose 渲染，段落数组） */
  bio: [
    copy("iAmLinYuAnIndependentFullStackDeveloperAndProductMakerOverThePastSixYearsIHaveTurnedEveryIdeaIWa"),
    copy("iAlwaysBuildThingsInReverseFirstComesAProblemThatBothersMeEveryDayThenAProductConstantInterrupti"),
    copy("iBelieveInSmallEnduringSoftwareThatOnePersonCanMaintainSustainAsABusinessAndUseForADecadeTechnol"),
    copy("thisSiteIsAlsoDogfoodEveryPixelFromTheAuroraBackgroundToTheGuestbookIsBuiltWithMyOwnComponentLib"),
  ],
  stats: [
    { value: 12400, label: "GitHub Star", suffix: "+" },
    { value: 386000, label: copy("totalDownloads"), suffix: "+" },
    { value: 5, label: copy("productsShipped") },
    { value: 2470, label: copy("coffeeForCoding"), suffix: copy("coffee") },
  ] as Stat[],
  socials: [
    { kind: "github", label: "GitHub", handle: "linyu", href: "https://github.com/" },
    { kind: "twitter", label: "X / Twitter", handle: "@linyu", href: "https://x.com/" },
    { kind: "dribbble", label: "Dribbble", handle: "linyu", href: "https://dribbble.com/" },
    { kind: "mail", label: copy("email"), handle: "hi@linyu.dev", href: "mailto:hi@linyu.dev" },
    { kind: "rss", label: "RSS", handle: "/feed", href: "#" },
  ] as Social[],
};

export const skills: Skill[] = [
  { name: copy("frontendReactTypescript"), level: 95, note: copy("componentLibrariesDesignSystemsMotion") },
  { name: copy("fullStackNodeRustGo"), level: 82, note: copy("localFirstEdgeFunctionsCli") },
  { name: copy("mobileSwiftSwiftui"), level: 78, note: copy("nativeIosWatchos") },
  { name: copy("productDesignFigma"), level: 88, note: copy("visualAndInteractionDesignFromZeroToOne") },
  { name: copy("growthContentSeo"), level: 70, note: copy("launchingAnIndependentProduct") },
];

export const stacks: StackGroup[] = [
  { group: copy("languages"), items: ["TypeScript", "Rust", "Swift", "Go", "Python"] },
  { group: copy("frontEnd"), items: ["React", "Next.js", "Vite", "Tailwind", "Motion", "WebGL"] },
  { group: copy("backendInfrastructure"), items: ["Node", "Tauri", "Cloudflare", "SQLite", "Postgres"] },
  { group: copy("designTools"), items: ["Figma", "Linear", "Raycast", "Vercel"] },
];

export const journey: JourneyItem[] = [
  { year: "2024", title: copy("becameAFullTimeIndieDeveloper"), desc: copy("leftMyJobToBuildIndependentProductsFullTimeSupportedByCodeframeAndTide"), tone: "primary" },
  { year: "2023", title: copy("releasedTideOnTheAppStore"), desc: copy("myFirstIndependentAppReached50000OrganicDownloadsInThreeMonths"), tone: "success" },
  { year: "2022", title: copy("openSourcedFlowctl"), desc: copy("aLocalWorkflowCliWithMoreThan10000GithubStars"), tone: "default" },
  { year: "2021", title: copy("leftMySecondJob"), desc: copy("movedFromFullStackEngineeringTowardBecomingAGeneralistWhoCanShipAnEntireProductAlone"), tone: "default" },
  { year: "2019", title: copy("wroteMyFirstLineOfRust"), desc: copy("discoveredTheLocalFirstSoftwarePhilosophy"), tone: "default" },
];
