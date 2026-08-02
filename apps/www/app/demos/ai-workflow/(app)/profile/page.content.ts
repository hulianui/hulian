import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    suYan: "苏砚",
    creativeDesigner: "创意设计师",
    useAIToPullThePictureOutOfYourHead: "用 AI 把脑子里的画面拽出来。专注品牌视觉与概念海报。",
    profileSaved: "资料已保存",
    profile: "个人资料",
    manageYourAccountInformationUsageAndCreativePreferences: "管理你的账户信息、用量与创作偏好。",
    sue: "苏",
    pro: "专业版",
    generatedThisMonth: "本月生成",
    comparedToLastMonth: "较上月",
    favoriteWorks: "收藏作品",
    remainingCredits: "剩余额度",
    usedThisMonth: "本月已用 32%",
    accountInformation: "账户信息",
    nickname: "昵称",
    roleTitle: "角色 / 头衔",
    email: "邮箱",
    bio: "个人简介",
    saving: "保存中…",
    saveChanges: "保存修改",
    recentCreations: "最近创作",
  },
  en: {
    suYan: "Su Yan",
    creativeDesigner: "Creative designer",
    useAIToPullThePictureOutOfYourHead:
      "I use AI to turn ideas into images, with a focus on brand systems and concept posters.",
    profileSaved: "Profile saved",
    profile: "Profile",
    manageYourAccountInformationUsageAndCreativePreferences:
      "Manage your account information, usage, and creative preferences.",
    sue: "Sue",
    pro: "Pro",
    generatedThisMonth: "Generated this month",
    comparedToLastMonth: "vs. last month",
    favoriteWorks: "Saved artifacts",
    remainingCredits: "Remaining credits",
    usedThisMonth: "32% used this month",
    accountInformation: "Account information",
    nickname: "Nickname",
    roleTitle: "Role / title",
    email: "Email",
    bio: "Bio",
    saving: "Saving...",
    saveChanges: "Save changes",
    recentCreations: "Recent creations",
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
  key: "demo-ai-workflow-app-profile-page",
  content: t(content),
};

export default dictionary;
