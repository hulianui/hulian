"use client";
// 「每页条数」切换器（对标 el-pagination 的 `page-sizes`）。
//
// 独立成文件而不是各写各的：这套 markup 在 ProTable 里已经存在两份（page 模式一份、cursor 模式
// 一份），Pagination 补上 #271 后就是第三份 —— 三处各自演进，迟早在尺寸档、宽度、无障碍名上分叉。
// 抽成一个内部件后三处共用同一份皮肤，改一次三处同步。
//
// 用库内 Select 而不是原生 `<select>`：原生控件的下拉列表由操作系统绘制，落在瑚琏的浮层语言之外
// （Windows 上尤其明显）。代价是 Pagination 的模块图里多了 Base UI Select —— 但真实场景里带
// 「条/页」的分页器几乎都长在中后台列表页上，那些页面本来就已经载入了 Select，实际增量接近零。
//
// 不导出到 barrel：它是 Pagination / ProTable 的实现细节，不是独立 API 面。
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";

export interface PageSizeSelectProps {
  /** 候选档（如 `[20, 50, 100]`）。 */
  options: readonly number[];
  /** 当前每页条数。 */
  value: number;
  onChange: (pageSize: number) => void;
  disabled?: boolean;
  /** 选项文案（如 `(n) => "20 条/页"`）。 */
  label: (pageSize: number) => string;
  /** 控件的无障碍名（说「这是什么」，不是它当前的值）。 */
  ariaLabel: string;
}

export function PageSizeSelect({
  options,
  value,
  onChange,
  disabled,
  label,
  ariaLabel,
}: PageSizeSelectProps) {
  const items = options.map((n) => ({ value: String(n), label: label(n) }));
  return (
    <Select
      items={items}
      value={String(value)}
      disabled={disabled}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel} className="w-28" />
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {label(n)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
