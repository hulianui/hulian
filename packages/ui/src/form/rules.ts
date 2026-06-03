// 校验规则引擎（纯函数，无 React）—— Form 增强的核心。可独立单测。
// 规则按序短路：第一条不通过即返回错误文案；全部通过返回 null。

export interface FormRule {
  /** 必填。 */
  required?: boolean;
  /** 正则格式（仅对字符串生效）。 */
  pattern?: RegExp;
  /** 下限：数字按数值、字符串/数组按长度。 */
  min?: number;
  /** 上限：数字按数值、字符串/数组按长度。 */
  max?: number;
  /** 自定义校验：抛错 / reject(Error) 表示不通过，错误 message 作提示。 */
  validator?: (value: unknown, values: Record<string, unknown>) => void | Promise<void>;
  /** 该规则未通过时的提示文案（覆盖默认）。 */
  message?: string;
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function checkRule(
  value: unknown,
  rule: FormRule,
  values: Record<string, unknown>,
): Promise<string | null> {
  if (rule.required && isEmpty(value)) return rule.message ?? "此项为必填项";

  // 非必填且为空 → 跳过余下格式/长度/自定义校验（与 Ant 一致）
  if (isEmpty(value)) {
    if (rule.validator) {
      try {
        await rule.validator(value, values);
      } catch (e) {
        return ruleError(e, rule);
      }
    }
    return null;
  }

  if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
    return rule.message ?? "格式不正确";
  }

  if (rule.min !== undefined) {
    const n = sizeOf(value);
    if (n < rule.min) {
      return rule.message ?? (typeof value === "number" ? `不能小于 ${rule.min}` : `至少 ${rule.min} 个字符`);
    }
  }
  if (rule.max !== undefined) {
    const n = sizeOf(value);
    if (n > rule.max) {
      return rule.message ?? (typeof value === "number" ? `不能大于 ${rule.max}` : `最多 ${rule.max} 个字符`);
    }
  }

  if (rule.validator) {
    try {
      await rule.validator(value, values);
    } catch (e) {
      return ruleError(e, rule);
    }
  }
  return null;
}

function sizeOf(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" || Array.isArray(value)) return value.length;
  return 0;
}

function ruleError(e: unknown, rule: FormRule): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e) return e;
  return rule.message ?? "校验失败";
}

/** 依次执行规则，返回首个错误文案；全部通过返回 null。 */
export async function validateValue(
  value: unknown,
  rules: FormRule[] | undefined,
  values: Record<string, unknown> = {},
): Promise<string | null> {
  if (!rules || rules.length === 0) return null;
  for (const rule of rules) {
    const err = await checkRule(value, rule, values);
    if (err) return err;
  }
  return null;
}
