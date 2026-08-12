"use client";
import { useCallback, useRef, useState } from "react";
import { validateValue, type FormRule } from "./rules";

export type FormValues = Record<string, unknown>;

export interface FieldConfig {
  /** 校验规则。 */
  rules?: FormRule[];
  /** 依赖字段：列出的字段变化时，本字段(若已 touched)重新校验 —— 字段联动。 */
  dependencies?: string[];
}

export interface UseFormOptions<V extends FormValues = FormValues> {
  /** 初始值（受控值的起点）。 */
  initialValues?: V;
  /** 任一字段变化时回调：(本次变化的 {name:value}, 全量 values)。 */
  onValuesChange?: (changed: Partial<V>, all: V) => void;
}

/** register() 返回的绑定 props，展开到 Field + 控件上。 */
export interface FieldBinding {
  name: string;
  value: unknown;
  onChange: (valueOrEvent: unknown) => void;
  onBlur: () => void;
  error?: string;
  /**
   * 该字段的 `rules` 里是否含 `required: true`（#180）。
   * 传给 `<Field required>` 即可让「必填」在提交前就看得见，规则仍是唯一校验来源。
   */
  required: boolean;
}

export interface FormInstance<V extends FormValues = FormValues> {
  values: V;
  errors: Record<string, string>;
  /** 注册字段并拿到绑定 props（在渲染期调用）。 */
  register: (name: string, config?: FieldConfig) => FieldBinding;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldsValue: (partial: Partial<V>) => void;
  getFieldValue: (name: string) => unknown;
  /** 校验单个字段，返回错误文案(或 null)。 */
  validateField: (name: string) => Promise<string | null>;
  /** 校验全部已注册字段。 */
  validate: () => Promise<{ ok: boolean; values: V; errors: Record<string, string> }>;
  resetFields: () => void;
  /** 生成 <form onSubmit>：校验通过调 onFinish，否则 onFinishFailed。 */
  submit: (
    onFinish: (values: V) => void,
    onFinishFailed?: (info: { values: V; errors: Record<string, string> }) => void,
  ) => (e?: { preventDefault?: () => void }) => Promise<void>;
}

function extractValue(valueOrEvent: unknown): unknown {
  if (
    valueOrEvent &&
    typeof valueOrEvent === "object" &&
    "target" in valueOrEvent &&
    (valueOrEvent as { target?: unknown }).target &&
    typeof (valueOrEvent as { target: { value?: unknown } }).target === "object"
  ) {
    const target = (valueOrEvent as { target: { value?: unknown; type?: string; checked?: boolean } }).target;
    if (target.type === "checkbox") return target.checked;
    return target.value;
  }
  return valueOrEvent;
}

/** 受控表单控制器：values + 校验规则引擎 + 字段联动 + onFinish/onFinishFailed。与瑚琏 Field 协同。 */
export function useForm<V extends FormValues = FormValues>(options: UseFormOptions<V> = {}): FormInstance<V> {
  const { initialValues = {} as V, onValuesChange } = options;
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 字段注册表（渲染期由 register 填充）+ touched 记录，存 ref 避免触发额外渲染
  const configs = useRef<Map<string, FieldConfig>>(new Map());
  const touched = useRef<Set<string>>(new Set());
  // values 最新值的同步镜像，供校验/联动在同一事件内读到最新（避免 setState 异步滞后）
  const valuesRef = useRef<V>(initialValues);
  valuesRef.current = values;

  const runValidate = useCallback(async (name: string, snapshot: V): Promise<string | null> => {
    const cfg = configs.current.get(name);
    const err = await validateValue(snapshot[name], cfg?.rules, snapshot);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[name] = err;
      else delete next[name];
      return next;
    });
    return err;
  }, []);

  const validateField = useCallback(
    (name: string) => runValidate(name, valuesRef.current),
    [runValidate],
  );

  const applyChange = useCallback(
    (name: string, value: unknown) => {
      const next = { ...valuesRef.current, [name]: value } as V;
      valuesRef.current = next;
      setValues(next);
      onValuesChange?.({ [name]: value } as Partial<V>, next);

      // 本字段若已 touched → 即时重校验
      if (touched.current.has(name)) void runValidate(name, next);
      // 字段联动：依赖了本字段的其他字段，若已 touched → 重校验
      for (const [other, cfg] of configs.current) {
        if (other !== name && cfg.dependencies?.includes(name) && touched.current.has(other)) {
          void runValidate(other, next);
        }
      }
    },
    [onValuesChange, runValidate],
  );

  const register = useCallback(
    (name: string, config?: FieldConfig): FieldBinding => {
      configs.current.set(name, config ?? {});
      const raw = valuesRef.current[name];
      return {
        name,
        // `null` 必须原样穿透（#220）。它是「显式清空 / 留空」这个**业务值**，与 `0`、`""` 一样
        // 是用户选出来的一档；`?? ""` 会把它塌成空串，于是 `form.values[name]` 是 null、
        // 而同一次渲染里 `register(name).value` 是 ""，两处口径对不上。消费方拿 binding 驱动
        // 受控控件是文档推荐用法，写了 `?? null` 也兜不住（`??` 只对 null/undefined 生效，
        // 空串直接穿透），最终控件收到签名外的 ""。三态字段（null 沿用上级 / 0 显式为零 /
        // 正整数覆盖）因此丢掉 null 这一档，而 null 与 0 恰是两个相反的业务结论。
        //
        // 只有 `undefined` 归一成 ""：那是「这个字段没有初始值」，把 undefined 交给受控控件
        // 会被 React 当成非受控，第一次输入就是「非受控 → 受控」的告警。
        //
        // 代价：把 binding 展开到**原生** `<input>` 上时，`value={null}` 会触发 React 的
        // 「value prop should not be null」告警。库内 Input / Textarea 已把 null 当空串兜住，
        // 直接用原生元素的消费方自己写 `value={v ?? ""}`（文档已写明）。
        value: raw === undefined ? "" : raw,
        onChange: (valueOrEvent: unknown) => applyChange(name, extractValue(valueOrEvent)),
        onBlur: () => {
          touched.current.add(name);
          void runValidate(name, valuesRef.current);
        },
        error: errors[name],
        // 必填态由规则派生（#180）：`<Field required={f.required}>` 就能画红星 + 落 aria-required，
        // 不必在规则之外再手写一遍必填 —— 两处各写一遍必然会漂移。
        required: (config?.rules ?? []).some((rule) => rule.required === true),
      };
    },
    [applyChange, runValidate, errors],
  );

  const setFieldValue = useCallback((name: string, value: unknown) => applyChange(name, value), [applyChange]);

  const setFieldsValue = useCallback(
    (partial: Partial<V>) => {
      const next = { ...valuesRef.current, ...partial } as V;
      valuesRef.current = next;
      setValues(next);
      onValuesChange?.(partial, next);
    },
    [onValuesChange],
  );

  const getFieldValue = useCallback((name: string) => valuesRef.current[name], []);

  const validate = useCallback(async () => {
    const snapshot = valuesRef.current;
    const names = Array.from(configs.current.keys());
    const results = await Promise.all(names.map((n) => validateValue(snapshot[n], configs.current.get(n)?.rules, snapshot)));
    const nextErrors: Record<string, string> = {};
    names.forEach((n, i) => {
      const err = results[i];
      if (err) nextErrors[n] = err;
      touched.current.add(n);
    });
    setErrors(nextErrors);
    return { ok: Object.keys(nextErrors).length === 0, values: snapshot, errors: nextErrors };
  }, []);

  const resetFields = useCallback(() => {
    valuesRef.current = initialValues;
    setValues(initialValues);
    setErrors({});
    touched.current.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(
    (
      onFinish: (values: V) => void,
      onFinishFailed?: (info: { values: V; errors: Record<string, string> }) => void,
    ) =>
      async (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        const { ok, values: v, errors: errs } = await validate();
        if (ok) onFinish(v);
        else onFinishFailed?.({ values: v, errors: errs });
      },
    [validate],
  );

  return {
    values,
    errors,
    register,
    setFieldValue,
    setFieldsValue,
    getFieldValue,
    validateField,
    validate,
    resetFields,
    submit,
  };
}
