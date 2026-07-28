export { RouteTabs } from "./route-tabs";
export type {
  RouteTabsProps,
  RouteTabItem,
  RouteTabsAction,
  RouteTabsMenuItem,
} from "./route-tabs.types";
// 批量动作的纯函数：受控消费方拿它算「这次该关哪些」，与组件同一份口径
export { affectedKeys, isClosable, nextActiveKey, orderTabs, reorderTabs } from "./route-tabs-core";
