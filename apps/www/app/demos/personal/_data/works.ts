import { copy } from "./works.content";
// 6 个虚构独立产品（SSoT）。每个作品的 device/bg 决定详情页用哪种设备外壳 + 哪种炫背景。
// 前 5 个 device/bg 刻意各不相同 → 5 件设备外壳 + 设计感背景全部真实出场；
// 第 6 个（留白·浏览器扩展）复用 chrome 外壳 + iridescence 背景，作为作品集自然生长的一笔。

export type DeviceKind = "chrome" | "iphone" | "tablet" | "terminal" | "watch";
/** 详情页 hero 背景：对应 @hulianui/ui 的设计感背景组件 */
export type BgKind = "silk" | "iridescence" | "wavy" | "threads" | "liquid-chrome";

export interface WorkShot {
  caption: string;
  /** 程序化 SVG 截图的布局变体（art.ts 用） */
  variant: "dashboard" | "editor" | "list" | "detail" | "chart";
}

export interface CodeSample {
  title: string;
  lang: string;
  code: string;
}

export interface Work {
  slug: string;
  name: string;
  nameEn: string;
  /** 一句话定位 */
  tagline: string;
  year: string;
  /** 品类：SaaS / 桌面 / APP / 开源库 / CLI / 微件 */
  category: string;
  status: "在线" | "开源" | "已下架" | "Beta";
  device: DeviceKind;
  bg: BgKind;
  /** 主色相 0–360，喂程序化截图 + Orb/Chip 点缀 */
  hue: number;
  stack: string[];
  links: { label: string; href: string }[];
  /** 详情页概述（2–3 段） */
  summary: string[];
  /** 亮点功能 bullet */
  highlights: { title: string; desc: string }[];
  /** 多图轮播的截图（程序化生成） */
  shots: WorkShot[];
  /** 关键代码片段（Code/Snippet 展示） */
  codeSample?: CodeSample;
  /** 安装/使用命令（Snippet 一键复制） */
  install?: string;
  /** 关键指标（NumberTicker / 文本） */
  metrics: { label: string; value: string }[];
}

export const WORK_STATUS_LABELS: Record<Work["status"], string> = {
  在线: copy("online"),
  开源: copy("openSource"),
  已下架: copy("unavailable"),
  Beta: copy("beta"),
};

export const works: Work[] = [
  {
    slug: "codemarker",
    name: copy("codeframe"),
    nameEn: "Codemarker",
    tagline: copy("turnCodeScreenshotsIntoArtworkWorthSharing"),
    year: "2024",
    category: "Web SaaS",
    status: "在线",
    device: "chrome",
    bg: "silk",
    hue: 222,
    stack: ["React", "TypeScript", "Vite", "Tailwind", "Satori", "Cloudflare"],
    links: [
      { label: copy("tryOnline"), href: "#" },
      { label: copy("source"), href: "#" },
    ],
    summary: [
      copy("codeframeIsABrowserBasedCodeImageToolPasteCodeChooseAThemeAndExportAHighResolutionImageWithWindo"),
      copy("itBeganWithMyOwnFrustrationWhenSharingTechnicalPostsSystemScreenshotsLookedPoorAndCarbonFeltSlow"),
    ],
    highlights: [
      { title: copy("text30ColorThemes"), desc: copy("customizeEverythingIncludingBrandColorsAndWindowStyles") },
      { title: copy("edgeRenderedExports"), desc: copy("cloudflareWorkersSatoriHighResolution2x4xPngAndSvg") },
      { title: copy("keyboardFirst"), desc: copy("vToPasteEToExportNoMouseRequired") },
    ],
    shots: [
      { caption: copy("editorWorkspace"), variant: "editor" },
      { caption: copy("themePicker"), variant: "list" },
      { caption: copy("exportPreview"), variant: "detail" },
    ],
    codeSample: {
      title: copy("edgeRenderedExports2"),
      lang: "ts",
      code: copy("renderCodeAsAnImageWithSatoriOnCloudflareWorkersImportSatoriFromSatoriExportAsyncFunctionRenderc"),
    },
    install: "npx codemarker ./app.tsx --theme tide --scale 2",
    metrics: [
      { label: copy("monthlyActiveUsers"), value: "42k" },
      { label: copy("exportImage"), value: copy("text19m") },
      { label: copy("themes"), value: "32" },
    ],
  },
  {
    slug: "tide",
    name: copy("tide"),
    nameEn: "Tide",
    tagline: copy("letFocusRiseAndFallLikeTheTide"),
    year: "2023",
    category: "iOS APP",
    status: "在线",
    device: "iphone",
    bg: "iridescence",
    hue: 188,
    stack: ["Swift", "SwiftUI", "CloudKit", "WidgetKit", "StoreKit 2"],
    links: [
      { label: "App Store", href: "#" },
      { label: copy("productPage"), href: "#" },
    ],
    summary: [
      copy("tideIsAnAntiPomodoroFocusAppInsteadOfForcingWorkInto25MinuteBlocksItFollowsYourRhythmWithABreath"),
      copy("myFirstIndependentAppStoreReleaseGrewOrganicallyTo50000DownloadsInThreeMonthsLockScreenWidgetsAn"),
    ],
    highlights: [
      { title: copy("adaptiveFocus"), desc: copy("suggestBreaksAroundYourRhythmInsteadOfSlicingTimeIntoRigidBlocks") },
      { title: copy("liveActivitiesWidgets"), desc: copy("dynamicIslandAndLockScreenShowTheCurrentFocusTideLive") },
      { title: copy("syncEverywhere"), desc: copy("cloudkitSyncsFocusHistoryWithoutAnAccount") },
    ],
    shots: [
      { caption: copy("focusDashboard"), variant: "detail" },
      { caption: copy("analytics"), variant: "chart" },
      { caption: copy("lockScreenWidget"), variant: "dashboard" },
    ],
    codeSample: {
      title: copy("breathingAnimationInSwiftui"),
      lang: "swift",
      code: copy("aTideRingThatBreathesSlowlyThroughoutAFocusSessionStructTideringViewPrivateVarPhase00VarBodySome"),
    },
    metrics: [
      { label: copy("download"), value: copy("text210k") },
      { label: "App Store", value: copy("text49Rating") },
      { label: copy("paidConversion"), value: "8.3%" },
    ],
  },
  {
    slug: "inkpad",
    name: copy("inkbook"),
    nameEn: "Inkpad",
    tagline: copy("aLocalFirstMarkdownNotebookWhereYourDataAlwaysBelongsToYou"),
    year: "2024",
    category: copy("desktopApp"),
    status: "在线",
    device: "tablet",
    bg: "wavy",
    hue: 268,
    stack: ["Tauri", "Rust", "React", "CodeMirror", "SQLite", "Automerge"],
    links: [
      { label: copy("download"), href: "#" },
      { label: copy("documentation"), href: "#" },
    ],
    summary: [
      copy("inkbookIsALocalFirstMarkdownNotebookDataStaysOnYourDevicesSyncsOnlyAfterEncryptionAndRemainsAvai"),
      copy("builtOnTauriAndRustItIsOnly8MbAndColdStartsIn03SecondsAutomergeCrdtsMergeEditsAcrossDevicesWitho"),
    ],
    highlights: [
      { title: copy("localFirst"), desc: copy("dataStaysInLocalSqliteAndReachesTheCloudOnlyAfterEndToEndEncryption") },
      { title: copy("conflictFreeSync"), desc: copy("automergeCrdtsMergeEditsAcrossDevicesAutomatically") },
      { title: copy("exceptionallyLightweight"), desc: copy("text8MbTauriPackageWithA300MsColdStart") },
    ],
    shots: [
      { caption: copy("splitEditor"), variant: "editor" },
      { caption: copy("notebook"), variant: "list" },
      { caption: copy("syncSettings"), variant: "detail" },
    ],
    codeSample: {
      title: copy("localEncryptedWritesInRust"),
      lang: "rust",
      code: copy("encryptNotesWithTheDeviceKeyBeforeWritingTheCloudSeesOnlyCiphertextPubFnSaveNoteNoteNoteKeyKeyRe"),
    },
    install: "brew install --cask inkpad",
    metrics: [
      { label: copy("appSize"), value: "8 MB" },
      { label: copy("coldStart"), value: "0.3s" },
      { label: copy("paidUsers"), value: "6.1k" },
    ],
  },
  {
    slug: "flowctl",
    name: "flowctl",
    nameEn: "flowctl",
    tagline: copy("orchestrateYourLocalWorkflowWithOneYamlFile"),
    year: "2022",
    category: copy("openSourceCli"),
    status: "开源",
    device: "terminal",
    bg: "threads",
    hue: 150,
    stack: ["Rust", "Tokio", "clap", "WASM"],
    links: [
      { label: "GitHub", href: "#" },
      { label: copy("documentation"), href: "#" },
    ],
    summary: [
      copy("flowctlIsALocalWorkflowOrchestratorDescribeRepetitiveDevelopmentTasksInYamlThenRunThemConcurrent"),
      copy("thisIsMyMostPopularOpenSourceProjectWithMoreThan10000GithubStarsItsCoreIsADagSchedulerBuiltWithR"),
    ],
    highlights: [
      { title: copy("declarativeDag"), desc: copy("describeTaskDependenciesInYamlWithAutomaticConcurrencyAndCaching") },
      { title: copy("wasmPlugins"), desc: copy("sandboxedPluginsWithZeroCrossPlatformDependencies") },
      { title: copy("polishedTty"), desc: copy("liveProgressTreeDurationFlameChartAndFailureReplay") },
    ],
    shots: [
      { caption: copy("runProgress"), variant: "dashboard" },
      { caption: copy("dependencyGraph"), variant: "chart" },
      { caption: copy("configurationExample"), variant: "editor" },
    ],
    codeSample: {
      title: copy("flowYamlWorkflowDefinition"),
      lang: "yaml",
      code: copy("declareTasksAndDependenciesFlowctlSchedulesThemConcurrentlyTasksBuildRunCargoBuildReleaseTestNee"),
    },
    install: "cargo install flowctl",
    metrics: [
      { label: "GitHub Star", value: "11.2k" },
      { label: copy("weeklyDownloads"), value: "38k" },
      { label: copy("contributors"), value: "84" },
    ],
  },
  {
    slug: "pulse",
    name: copy("pulse"),
    nameEn: "Pulse",
    tagline: copy("yourHealthAtAGlanceOnYourWrist"),
    year: "2025",
    category: copy("watchosWidget"),
    status: "Beta",
    device: "watch",
    bg: "liquid-chrome",
    hue: 344,
    stack: ["Swift", "WidgetKit", "HealthKit", "Swift Charts"],
    links: [
      { label: "TestFlight", href: "#" },
      { label: copy("productPage"), href: "#" },
    ],
    summary: [
      copy("pulseIsAnAppleWatchHealthWidgetThatBringsHeartRateHrvActivityRingsAndSleepIntoOneComplicationFor"),
      copy("nowInBetaThisIsMyFirstWatchosProjectTheHardestPartWasFittingFourDimensionsOfDataIntoATinyComplic"),
    ],
    highlights: [
      { title: copy("watchComplication"), desc: copy("heartRateHrvActivityAndSleepInOneView") },
      { title: copy("trendColoring"), desc: copy("colorAlertsAppearAutomaticallyWhenDataMovesOutsideItsBaseline") },
      { title: copy("batteryEfficient"), desc: copy("incrementalRefreshThatBarelyAffectsAFullDaySBattery") },
    ],
    shots: [
      { caption: copy("watchComplication"), variant: "detail" },
      { caption: copy("trendChart"), variant: "chart" },
      { caption: copy("settings"), variant: "list" },
    ],
    codeSample: {
      title: copy("widgetkitTimelineRefresh"),
      lang: "swift",
      code: copy("refreshTheWatchComplicationIncrementallyToConserveBatteryStructPulseproviderTimelineproviderFunc"),
    },
    metrics: [
      { label: copy("betaUsers"), value: "1.4k" },
      { label: copy("refreshInterval"), value: "10 min" },
      { label: copy("batteryUse"), value: copy("text2Day") },
    ],
  },
  {
    slug: "marginalia",
    name: copy("whitespace"),
    nameEn: "Marginalia",
    tagline: copy("turnAnyWebPageIntoACleanReadingExperience"),
    year: "2025",
    category: copy("browserExtension"),
    status: "在线",
    device: "chrome",
    bg: "iridescence",
    hue: 32,
    stack: ["TypeScript", "WXT", "React", "Readability", "IndexedDB"],
    links: [
      { label: copy("chromeWebStore"), href: "#" },
      { label: copy("source"), href: "#" },
    ],
    summary: [
      copy("whitespaceIsABrowserExtensionThatTurnsPagesCrowdedWithPopUpsAdsAndSidebarsIntoCalmReadingViewsAd"),
      copy("itGrewFromAPersonalObsessionGoodWritingIsOftenRuinedByBadLayoutsWhitespaceExtractsTheArticleWith"),
    ],
    highlights: [
      { title: copy("oneClickReadingMode"), desc: copy("extractTheArticleRemoveDistractionsAndCustomizeFontAndColumnWidth") },
      { title: copy("localReadLater"), desc: copy("articlesAreStoredInIndexeddbForOfflineAccountFreeReading") },
      { title: copy("keyboardOnly"), desc: copy("pressRToReadAndJKToMoveBetweenSectionsEntirelyFromTheKeyboard") },
    ],
    shots: [
      { caption: copy("readingMode"), variant: "detail" },
      { caption: copy("readLaterList"), variant: "list" },
      { caption: copy("appearance"), variant: "editor" },
    ],
    codeSample: {
      title: copy("extractArticlesWithReadability"),
      lang: "ts",
      code: copy("contentScriptExtractCleanArticleHtmlAndStoreItLocallyImportReadabilityFromExportFunctionExtracta"),
    },
    metrics: [
      { label: copy("installs"), value: copy("text58k") },
      { label: copy("storeRating"), value: copy("text48Rating") },
      { label: copy("cleanedArticles"), value: copy("text32m") },
    ],
  },
];

export function workBySlug(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

/** 上一/下一篇导航（环形） */
export function workNav(slug: string): { prev: Work; next: Work } | null {
  const i = works.findIndex((w) => w.slug === slug);
  if (i < 0) return null;
  return {
    prev: works[(i - 1 + works.length) % works.length],
    next: works[(i + 1) % works.length],
  };
}
