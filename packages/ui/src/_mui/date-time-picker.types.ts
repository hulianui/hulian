export interface DateTimePickerProps {
  /** ISO 字符串；受控值（含日期+时间） */
  value?: string | null;
  /** ISO 字符串；非受控默认值 */
  defaultValue?: string;
  /** 瑚琏命名受控回调（替代 MUI onChange(value)）；回传 ISO 或 null */
  onValueChange?: (iso: string | null) => void;
  /** 可选最早日期时间（ISO） */
  minDateTime?: string;
  /** 可选最晚日期时间（ISO） */
  maxDateTime?: string;
  /** 时间步进分钟数（如 5、15、30） */
  minutesStep?: number;
  /** 是否启用秒（默认 false，仅到分钟） */
  withSeconds?: boolean;
  /**
   * 逐日禁用判定，入参是 `"YYYY-MM-DD"`（只作用于日期部分，不筛时刻）。
   * 与 `minDateTime`/`maxDateTime` 是「或」关系。
   */
  disabledDate?: (isoDate: string) => boolean;
  /**
   * 输入框显示格式（dayjs format 串）。**只影响显示**，`onValueChange` 回传的仍是完整 ISO 时间戳。
   */
  format?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** 输入框 label */
  label?: string;
  className?: string;
}
