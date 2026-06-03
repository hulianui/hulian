import type { ReactNode } from "react";

export interface TransferItem {
  /** 唯一键（移动/选中/禁用都用它）。 */
  key: string;
  label: ReactNode;
  /** 次级描述（label 下方 muted 小字）。 */
  description?: ReactNode;
  /** 禁用项：不可被勾选、不随「全部」移动。 */
  disabled?: boolean;
}

export interface TransferProps {
  /** 全量数据源。 */
  dataSource: TransferItem[];
  /** 受控：右侧（目标）面板的键集合。 */
  targetKeys?: string[];
  /** 非受控初始目标键。 */
  defaultTargetKeys?: string[];
  /**
   * 移动后回调。
   * @param targetKeys 移动后的目标键集合
   * @param direction 本次移动方向（right=入选 / left=移出）
   * @param movedKeys 本次移动的键
   */
  onChange?: (targetKeys: string[], direction: "left" | "right", movedKeys: string[]) => void;
  /** 左右面板标题。@default ["源列表","已选"] */
  titles?: [ReactNode, ReactNode];
  /** 是否在每个面板顶部显示搜索框。 */
  searchable?: boolean;
  /** 搜索框占位符。@default "搜索" */
  searchPlaceholder?: string;
  /** 自定义过滤；默认按 label 字符串包含匹配（大小写不敏感）。 */
  filterOption?: (input: string, item: TransferItem) => boolean;
  /** 整体禁用（两侧列表与移动按钮全失效）。 */
  disabled?: boolean;
  className?: string;
}
