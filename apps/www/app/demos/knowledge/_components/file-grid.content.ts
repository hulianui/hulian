import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    previewingThisFileTypeIsNotSupportedYet: "暂不支持预览此文件类型",
    deletedItemCount: "已删除 {0} 项",
    thisFolderIsEmpty: "此文件夹为空",
    rightClickTheDirectoryTreeToCreateANewDocument:
      "右键目录树新建文档 / 文件夹，或拖文件到左下角上传区。",
    newDocument: "新建文档",
    selected: "已选",
    item: "项",
    batchMove: "批量移动",
    deleteSelectedItemsPrompt: "删除选中的 {0} 项？",
    thisActionCannotBeUndone: "此操作不可撤销。",
    remove: "删除",
    bulkDelete: "批量删除",
    selectItemLabel: "选择 {0}",
    new: "新",
    childItemCount: "{0} 项",
  },
  en: {
    previewingThisFileTypeIsNotSupportedYet: "Preview is not available for this file type.",
    deletedItemCount: "Deleted {0} items",
    thisFolderIsEmpty: "This folder is empty",
    rightClickTheDirectoryTreeToCreateANewDocument:
      "Right-click the directory tree to create a document or folder, or drop files into the upload area.",
    newDocument: "New document",
    selected: "Selected",
    item: "Item",
    batchMove: "Move selected",
    deleteSelectedItemsPrompt: "Delete {0} selected items?",
    thisActionCannotBeUndone: "This action cannot be undone.",
    remove: "Remove",
    bulkDelete: "Delete selected",
    selectItemLabel: "Select {0}",
    new: "New",
    childItemCount: "{0} items",
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
  key: "demo-knowledge-components-file-grid",
  content: t(content),
};

export default dictionary;
