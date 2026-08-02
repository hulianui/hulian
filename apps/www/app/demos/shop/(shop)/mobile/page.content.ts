import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    mobileStorefrontExperience: "H5 商城 · 移动端体验",
    aCompleteHanshopMobileDemoFeaturingBottomTabNavigationPullToRefreshSwipeActionsFilterSheetsVaria: "瀚选移动版完整演示：TabBar 底导、PullToRefresh 下拉刷新、SwipeAction 左滑删除、\n          ActionSheet 筛选、Picker 选规格、Fab 悬浮客服、SafeArea 安全区适配。\n          所有浮层约束在手机屏幕内，不跑出外壳。",
    iphone16ProHomeCategoriesCartAccount: "iPhone 16 Pro · 首页 / 分类 / 购物车 / 我的",
    mobileComponentCoverage: "Mobile 组件族覆盖清单",
    deviceFrameWithChildrenFillingTheScreen: "设备外壳，children 填充屏幕",
    topNotchAndHomeIndicatorAdaptation: "顶部刘海 + 底部横条适配",
    fixedFalseKeepsTheBarAtTheBottomOfTheDocumentFlow: "fixed={false} 随文档流贴屏底",
    pullToRefreshProductListOnHome: "首页商品列表下拉刷新",
    filterAndSortSheetOnCategories: "分类页筛选排序弹单",
    wheelPickerForVariantsAndColors: "规格/颜色滚轮选择",
    swipeActionsOnCategoryProductsAndCartRows: "分类商品行 + 购物车行左滑操作",
    floatingSupportSpeedDialInTheLowerRightCorner: "右下角悬浮客服 speed-dial",
    overlayLayoutTheScreenContainerUses: "浮层定位方案：屏幕容器设",
    fabUses: "，\n              Fab 用",
    overlayPositioningTabbarUses: "覆盖层，\n              TabBar 用",
    andActionsheetUsesABaseUiDialogPortalWithoutAffectingTheInFrameLayout: "，\n              ActionSheet 基于 Base UI Dialog Portal 挂根节点不影响屏内布局。",
  },
  en: {
    mobileStorefrontExperience: "Mobile storefront experience",
    aCompleteHanshopMobileDemoFeaturingBottomTabNavigationPullToRefreshSwipeActionsFilterSheetsVaria: "A complete HanShop mobile demo featuring bottom-tab navigation, pull to refresh, swipe actions, filter sheets, variant pickers, a floating support button, and safe-area handling. Every overlay stays within the phone frame.",
    iphone16ProHomeCategoriesCartAccount: "iPhone 16 Pro · Home / Categories / Cart / Account",
    mobileComponentCoverage: "Mobile component coverage",
    deviceFrameWithChildrenFillingTheScreen: "Device frame with children filling the screen",
    topNotchAndHomeIndicatorAdaptation: "Top notch and home-indicator adaptation",
    fixedFalseKeepsTheBarAtTheBottomOfTheDocumentFlow: "fixed={false} keeps the bar at the bottom of the document flow",
    pullToRefreshProductListOnHome: "Pull-to-refresh product list on Home",
    filterAndSortSheetOnCategories: "Filter and sort sheet on Categories",
    wheelPickerForVariantsAndColors: "Wheel picker for variants and colors",
    swipeActionsOnCategoryProductsAndCartRows: "Swipe actions on category products and cart rows",
    floatingSupportSpeedDialInTheLowerRightCorner: "Floating support speed dial in the lower-right corner",
    overlayLayoutTheScreenContainerUses: "Overlay layout: the screen container uses ",
    fabUses: "; Fab uses ",
    overlayPositioningTabbarUses: " overlay positioning; TabBar uses ",
    andActionsheetUsesABaseUiDialogPortalWithoutAffectingTheInFrameLayout: "; and ActionSheet uses a Base UI Dialog Portal without affecting the in-frame layout.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--shop-mobile-page", content: t(content) };
export default dictionary;
