import type { ReactNode } from "react";

export type DossierSectionStatus = "empty" | "partial" | "done";

export interface DossierSection {
  key: string;
  label: ReactNode;
  /** @default "empty" */
  status?: DossierSectionStatus;
  /** 可选域：不计入进度分母，empty 时弱化显示并标注「可选」 */
  optional?: boolean;
  /** 已归档内容摘要（一两行） */
  summary?: ReactNode;
  /** 当前正在采集的域，高亮 */
  active?: boolean;
}

export interface DossierProps {
  sections: DossierSection[];
  /** @default "案卷" */
  title?: ReactNode;
  /** 头部右侧进度文案，缺省自动算「已归档 n/m」（m 不含 optional 域） */
  progress?: ReactNode;
  /** 去掉容器边框背景，内嵌用 @default false */
  bare?: boolean;
  className?: string;
}
