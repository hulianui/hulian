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

export interface SetFieldsValueOptions {
  /**
   * 把这批值同时钉成新的干净基线（`isDirty()` 重新从 false 起算）。
   * 异步回填详情时传 `true`：那批值是初始态，不是用户改的。
   */
  markPristine?: boolean;
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
  /**
   * 批量赋值。`markPristine` 把这批值同时钉成新的「干净基线」（#345）——
   * **异步回填的编辑表单必须传它**，否则数据一到 `isDirty()` 就恒为 true。
   */
  setFieldsValue: (partial: Partial<V>, options?: SetFieldsValueOptions) => void;
  getFieldValue: (name: string) => unknown;
  /** 校验单个字段，返回错误文案(或 null)。 */
  validateField: (name: string) => Promise<string | null>;
  /** 校验全部已注册字段。 */
  validate: () => Promise<{ ok: boolean; values: V; errors: Record<string, string> }>;
  /**
   * 清回 `initialValues` 并清空错误与 touched，同时把脏基线一并复位。
   *
   * 用的是**当前**的 `initialValues`（0.63.0 起）：此前闭包锁死在首帧那一份，
   * 消费方换了 `initialValues` 再 reset 会回到旧值 —— 那是缺陷不是约定。
   *
   * 刻意不收「新初始值」参数：那会把 `V` 放到参数位置，`FormInstance<具体类型>`
   * 从此不能再赋给 `FormInstance<FormValues>`（逆变），编排件的 `form?: FormInstance`
   * 会当场拒收所有带具体值类型的实例。换一条记录继续编辑用
   * `setFieldsValue(next, { markPristine: true })`。
   */
  resetFields: () => void;
  /**
   * 把**此刻**的值钉成新的干净基线，于是 `isDirty()` 重新从 false 起算（#345）。
   *
   * 用于异步回填：`initialValues` 在首帧多半是空壳，详情回来后填进去的那批值属于
   * 「初始态」而不是「用户的编辑」。回填走 `setFieldsValue(v, { markPristine: true })`
   * 更省一步；值已经由别的途径进去时（逐字段 `setFieldValue`、控件自填默认值）用这个。
   */
  markPristine: () => void;
  /**
   * 当前值是否与 `initialValues` 不同（#343）。
   *
   * 用来回答「这张表单被人动过吗」——关闭确认（"还没提交，确定放弃？"）、
   * 离开页面拦截、把提交键在无改动时置灰，都靠它。
   *
   * 逐字段深比较值本身而不是比引用：多选字段是数组、级联字段是对象，每次 onChange 都会
   * 产出新引用，比引用会让「改了又改回来」也算脏。`resetFields()` 之后必然回到 false。
   */
  isDirty: () => boolean;
  /** 生成 <form onSubmit>：校验通过调 onFinish，否则 onFinishFailed。 */
  submit: (
    onFinish: (values: V) => void,
    onFinishFailed?: (info: { values: V; errors: Record<string, string> }) => void,
  ) => (e?: { preventDefault?: () => void }) => Promise<void>;
}

/**
 * 表单值的相等判定（#343）：只认表单里真会出现的形状 —— 原始值、数组（多选）、
 * 普通对象（级联 / 日期区间）、Date。刻意不做通用深比较：Map / Set / 循环引用不在表单值域内，
 * 为它们付出的复杂度只会变成看不懂的分支。
 */
function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => sameValue(item, b[i]));
  }
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    return ka.every(
      (k) =>
        Object.hasOwn(b as object, k) &&
        sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    );
  }
  return false;
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
  // 脏判定的基准（#343）：首帧的 initialValues 快照。不能直接读闭包里的 initialValues ——
  // 消费方多半写成对象字面量，每次渲染都是新的一份，一旦它在渲染间被重建成「当前值」，
  // isDirty() 就永远是 false。resetFields() 会把这份基准一并刷新，语义上等同于「重新开始」。
  const pristineRef = useRef<V>(initialValues);
  // 跟踪**当前**的 initialValues：resetFields 过去锁死在首帧那一份（useCallback 空依赖 +
  // eslint-disable），消费方换了初始值再 reset 会回到旧值。ref 每次渲染刷新，闭包读它就跟得上。
  const initialValuesRef = useRef<V>(initialValues);
  initialValuesRef.current = initialValues;

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
    (partial: Partial<V>, options?: SetFieldsValueOptions) => {
      const next = { ...valuesRef.current, ...partial } as V;
      valuesRef.current = next;
      // 与赋值同步钉基线，而不是让消费方回填后再调一次 markPristine：那样要多等一轮
      // 渲染，中间任何一次 isDirty() 都会读到「已改动」。
      if (options?.markPristine) pristineRef.current = next;
      setValues(next);
      onValuesChange?.(partial, next);
    },
    [onValuesChange],
  );

  const markPristine = useCallback(() => {
    pristineRef.current = valuesRef.current;
  }, []);

  const getFieldValue = useCallback((name: string) => valuesRef.current[name], []);

  const isDirty = useCallback(() => {
    const current = valuesRef.current;
    const pristine = pristineRef.current;
    const keys = new Set([...Object.keys(current), ...Object.keys(pristine)]);
    for (const key of keys) {
      if (!sameValue(current[key], pristine[key])) return true;
    }
    return false;
  }, []);

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
    const base = initialValuesRef.current;
    valuesRef.current = base;
    // 基准一并回到初始值：重置之后 isDirty() 必须是 false（#343）。
    pristineRef.current = base;
    setValues(base);
    setErrors({});
    touched.current.clear();
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
    markPristine,
    isDirty,
    submit,
  };
}
