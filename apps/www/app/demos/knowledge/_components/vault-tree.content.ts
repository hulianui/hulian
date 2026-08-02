import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    nameCannotBeEmpty: "名称不能为空",
    contents: "目录",
    newDocument: "新建文档",
    newFolder: "新建文件夹",
    searchFilesDocuments: "搜索文件 / 文档",
    rename: "重命名",
    moveTo: "移动到…",
    remove: "删除",
    rejectedFileCount: "{0} 个文件被拒绝",
    typeOrSizeMismatch: "类型或大小不符",
    uploading: "上传中…",
    dropFilesHereOrClickToUpload: "拖拽文件到此或点击上传",
    supportImagePDFMarkdownSingleFile10MB: "支持图片 / PDF / Markdown，单文件 ≤ 10MB",
    uploadingTo: "正在上传到「{0}」",
    rootDirectory: "根目录",
    enterANewNameForTheDocumentOrFolder: "为该文档或文件夹输入新名称。",
    newName: "新名称",
    cancel: "取消",
    confirm: "确认",
    delete: "删除「{0}」？",
    allSubItemsInTheFolderWillBeDeletedAt: "文件夹内所有子项会一并删除，此操作不可撤销。",
  },
  en: {
    nameCannotBeEmpty: "Name cannot be empty",
    contents: "Contents",
    newDocument: "New document",
    newFolder: "New folder",
    searchFilesDocuments: "Search files and documents",
    rename: "Rename",
    moveTo: "Move to...",
    remove: "Delete",
    rejectedFileCount: "{0} files rejected",
    typeOrSizeMismatch: "Type or size mismatch",
    uploading: "Uploading...",
    dropFilesHereOrClickToUpload: "Drop files here or click to upload",
    supportImagePDFMarkdownSingleFile10MB: "Images, PDF, and Markdown · 10 MB per file",
    uploadingTo: 'Uploading to "{0}"',
    rootDirectory: "Root directory",
    enterANewNameForTheDocumentOrFolder: "Enter a new name for the document or folder.",
    newName: "New name",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: 'Delete "{0}"?',
    allSubItemsInTheFolderWillBeDeletedAt:
      "Everything inside this folder will also be deleted. This action cannot be undone.",
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
  key: "demo-knowledge-components-vault-tree",
  content: t(content),
};

export default dictionary;
