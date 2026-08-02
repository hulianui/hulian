import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    coral: "瑚",
    reefFlowStudio: "瑚琏 Flow Studio",
    switchToLight: "切换到亮色",
    switchToDark: "切换到暗色",
    vincentHighDefinitionEnlargementRunCompleted: "「文生图 · 高清放大」运行完成",
    ofGeneratedQuotaRemainingThisMonth: "本月生成额度剩余 68%",
    templateTucsonVideoHasBeenUpdated: "模板「图生视频」已更新",
    twoMinutesAgo: "2 分钟前",
    oneHourAgo: "1 小时前",
    yesterday: "昨天",
    notifications: "通知",
    seeAll: "查看全部",
    accountMenu: "账户菜单",
    sue: "苏",
    suYan: "苏砚",
    creativeDesigner: "创意设计师",
    profile: "个人资料",
    accountSettings: "账户设置",
    logOut: "退出登录",
    backToSampleLibrary: "返回示例库",
  },
  en: {
    coral: "H",
    reefFlowStudio: "Hulian Flow Studio",
    switchToLight: "Switch to light",
    switchToDark: "Switch to dark",
    vincentHighDefinitionEnlargementRunCompleted: '"Text to Image · HD Upscale" run completed',
    ofGeneratedQuotaRemainingThisMonth: "68% of this month's generation quota remains",
    templateTucsonVideoHasBeenUpdated: 'The "Image to Video" template was updated',
    twoMinutesAgo: "2 minutes ago",
    oneHourAgo: "1 hour ago",
    yesterday: "Yesterday",
    notifications: "Notifications",
    seeAll: "See all",
    accountMenu: "Account menu",
    sue: "Sue",
    suYan: "Su Yan",
    creativeDesigner: "Creative designer",
    profile: "Profile",
    accountSettings: "Account settings",
    logOut: "Log out",
    backToSampleLibrary: "Back to demo gallery",
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
  key: "demo-ai-workflow-components-studio-shell",
  content: t(content),
};

export default dictionary;
