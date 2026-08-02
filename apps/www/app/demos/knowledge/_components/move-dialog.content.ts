import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    hankuRootDirectory: "瀚库（根目录）",
    moveItemCountTitle: "移动 {0} 项",
    selectTheDestinationFolderAndTheMovedItemsWillBe:
      "选择目标文件夹，被移动项将连同子内容一起迁移。",
    cancel: "取消",
    moveHere: "移动到此处",
    toBeMoved: "待移动",
    itemNameSeparator: "、",
    destinationFolder: "目标文件夹",
    selectDestinationFolder: "选择目标文件夹",
  },
  en: {
    hankuRootDirectory: "HanVault (root)",
    moveItemCountTitle: "Move {0} items",
    selectTheDestinationFolderAndTheMovedItemsWillBe:
      "Choose a destination folder. Folder contents move with their parent.",
    cancel: "Cancel",
    moveHere: "Move here",
    toBeMoved: "Items to move",
    itemNameSeparator: ", ",
    destinationFolder: "Destination folder",
    selectDestinationFolder: "Select destination folder",
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
  key: "demo-knowledge-components-move-dialog",
  content: t(content),
};

export default dictionary;
