import type { ReactNode } from "react";

export interface IcpRecord {
  /** 备案号，如 闽ICP备2024073556号-1 */
  number: string;
  /** 覆盖默认 miit 链接 */
  href?: string;
}

export interface PoliceRecord {
  /** 公网安备号，如 闽公网安备35030302900030号 */
  number: string;
  /** 覆盖默认 mps 链接 */
  href?: string;
}

export interface BeianFooterProps {
  /** ICP 备案号，可多个（如 -1 / -2 主体下多站）。默认链 beian.miit.gov.cn */
  icp?: IcpRecord[];
  /** 公网安备号，带警徽图标。默认链 beian.mps.gov.cn */
  police?: PoliceRecord;
  /** 备案前缀文案，默认 "ICP备案" */
  icpLabel?: ReactNode;
  /** 版权/补充行 */
  copyright?: ReactNode;
  className?: string;
}
