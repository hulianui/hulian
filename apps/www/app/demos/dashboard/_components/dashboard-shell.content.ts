import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    dataSourceAbnormalTheHeartbeatOfTheDispatchCenterTimed:
      "数据源「异常」：调度中心心跳超时，实时指标拉取失败。请切回「正常」或稍后重试。",
    dataSourceSwitched: "已切换数据源：{0}",
    refreshingLiveMetrics: "正在刷新实时指标…",
    realTimeRefreshResumed: "已恢复实时刷新",
    liveRefreshStopped: "已停止实时刷新",
    realTimeDataSourceException: "实时数据源异常",
    retry: "重试",
  },
  en: {
    dataSourceAbnormalTheHeartbeatOfTheDispatchCenterTimed:
      'Data source "Error": the control-plane heartbeat timed out, so live metrics could not be loaded. Switch back to "Healthy" or try again later.',
    dataSourceSwitched: "Data source switched: {0}",
    refreshingLiveMetrics: "Refreshing live metrics...",
    realTimeRefreshResumed: "Live refresh resumed",
    liveRefreshStopped: "Live refresh stopped",
    realTimeDataSourceException: "Live data source error",
    retry: "Retry",
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
  key: "demo-dashboard-components-dashboard-shell",
  content: t(content),
};

export default dictionary;
