import type { FileStatus } from "@hulianui/ui";

/** 节点种类：文件夹 / 文档(markdown) / 图片 / 其它文件。 */
export type VaultKind = "folder" | "doc" | "image" | "file";

export interface VaultNode {
  id: string;
  name: string;
  kind: VaultKind;
  /** 父文件夹 id；根节点为 null。树由 parentId 关系构建。 */
  parentId: string | null;
  /** 近期改动状态，复用 FileTree 的 A/M/D/U/R 角标语义。 */
  status?: FileStatus;
  /** 固定字符串，避免运行期 Date（静态可复现）。 */
  updatedAt: string;
  author: string;
  /** 字节数（file / image）。 */
  size?: number;
  tags?: string[];
  /** kind=doc 的 markdown 正文。 */
  content?: string;
  /** kind=image 的程序化 SVG data-URI。 */
  src?: string;
  /** 协作者姓名（关联 COLLABORATORS）。 */
  collaborators?: string[];
}

export type ViewMode = "doc" | "file";

/** 版本历史项（右栏 Timeline）。 */
export interface VersionEntry {
  rev: string;
  author: string;
  at: string;
  note: string;
}

export interface Collaborator {
  name: string;
  role: string;
  /** 本地头像 jpg（零外链）。 */
  avatar: string;
}
