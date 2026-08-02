import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    hanyunGlobalDispatchCommandCenter: "瀚云全球调度指挥中心",
    dataSourceNormal: "数据源：正常",
    dataSourceException: "数据源：异常",
    dataSource: "数据源",
    manualRefresh: "手动刷新",
    stopLiveRefresh: "停止实时刷新？",
    afterStoppingTheLargeScreenWillNoLongerAutomaticallyPull:
      "停止后大屏将不再自动拉取实时指标，需手动刷新。",
    stop: "停止",
    stopLiveRefreshAlternate: "停止实时刷新",
    resumeLiveRefresh: "恢复实时刷新",
    fullscreen: "全屏",
    toggleLightAndDark: "切换明暗",
  },
  en: {
    hanyunGlobalDispatchCommandCenter: "Hulian Global Traffic Command Center",
    dataSourceNormal: "Data source: Healthy",
    dataSourceException: "Data source: Error",
    dataSource: "Data source",
    manualRefresh: "Manual refresh",
    stopLiveRefresh: "Stop live refresh?",
    afterStoppingTheLargeScreenWillNoLongerAutomaticallyPull:
      "The dashboard will stop fetching live metrics. You can still refresh them manually.",
    stop: "Stop",
    stopLiveRefreshAlternate: "Stop live refresh",
    resumeLiveRefresh: "Resume live refresh",
    fullscreen: "Fullscreen",
    toggleLightAndDark: "Toggle color theme",
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
  key: "demo-dashboard-components-header-bar",
  content: t(content),
};

export default dictionary;
