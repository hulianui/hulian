import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    useknowledgeMustBeUsedWithinKnowledgeShell: "useKnowledge 必须在 KnowledgeShell 内使用",
    library: "库",
    hanvault: "瀚库 HanVault",
    teamKnowledgeBase: "团队知识库",
    switchToLight: "切换到亮色",
    switchToDark: "切换到暗色",
    lightMode: "亮色模式",
    darkMode: "暗色模式",
    notifications: "通知",
    forestIsland: "林屿",
    frontEndLead: "前端 Lead",
    hayashi: "林",
    failedToLoadKnowledgeBase: "知识库加载失败",
    retry: "重试",
    nothingSelected: "未选择内容",
    selectADocumentOrFolderFromTheDirectoryTreeOn: "从左侧目录树选择一个文档或文件夹",
  },
  en: {
    useknowledgeMustBeUsedWithinKnowledgeShell: "useKnowledge must be used within KnowledgeShell",
    library: "Library",
    hanvault: "HanVault",
    teamKnowledgeBase: "Team knowledge base",
    switchToLight: "Switch to light",
    switchToDark: "Switch to dark",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    notifications: "Notifications",
    forestIsland: "Lin Yu",
    frontEndLead: "Front-end lead",
    hayashi: "Lin",
    failedToLoadKnowledgeBase: "Failed to load knowledge base",
    retry: "Retry",
    nothingSelected: "Nothing selected",
    selectADocumentOrFolderFromTheDirectoryTreeOn:
      "Select a document or folder from the directory tree.",
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
  key: "demo-knowledge-components-knowledge-shell",
  content: t(content),
};

export default dictionary;
