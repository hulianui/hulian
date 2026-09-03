import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "./use-form";

describe("useForm 控制器", () => {
  it("register + onChange 更新 values，并触发 onValuesChange", () => {
    const onValuesChange = vi.fn();
    const { result } = renderHook(() => useForm({ initialValues: { name: "" }, onValuesChange }));
    act(() => {
      result.current.register("name").onChange("瑚琏");
    });
    expect(result.current.values.name).toBe("瑚琏");
    expect(onValuesChange).toHaveBeenCalledWith({ name: "瑚琏" }, { name: "瑚琏" });
  });

  it("onChange 支持原生事件对象（取 target.value）", () => {
    const { result } = renderHook(() => useForm({ initialValues: { email: "" } }));
    act(() => {
      result.current.register("email").onChange({ target: { value: "a@b.com" } });
    });
    expect(result.current.values.email).toBe("a@b.com");
  });

  it("validate：required 不通过 → ok=false + errors 落项", async () => {
    const { result } = renderHook(() => useForm({ initialValues: { name: "" } }));
    act(() => {
      result.current.register("name", { rules: [{ required: true, message: "请填名字" }] });
    });
    let res: { ok: boolean } | undefined;
    await act(async () => {
      res = await result.current.validate();
    });
    expect(res!.ok).toBe(false);
    expect(result.current.errors.name).toBe("请填名字");
  });

  it("submit：通过调 onFinish，不通过调 onFinishFailed", async () => {
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    const { result } = renderHook(() => useForm({ initialValues: { name: "" } }));
    act(() => {
      result.current.register("name", { rules: [{ required: true }] });
    });
    // 空值提交 → failed
    await act(async () => {
      await result.current.submit(onFinish, onFinishFailed)({ preventDefault: () => {} });
    });
    expect(onFinishFailed).toHaveBeenCalledOnce();
    expect(onFinish).not.toHaveBeenCalled();
    // 填值后提交 → finish
    act(() => {
      result.current.setFieldValue("name", "瑚琏");
    });
    await act(async () => {
      await result.current.submit(onFinish, onFinishFailed)();
    });
    expect(onFinish).toHaveBeenCalledWith({ name: "瑚琏" });
  });

  it("blur 触发单字段校验", async () => {
    const { result } = renderHook(() => useForm({ initialValues: { name: "" } }));
    let binding!: ReturnType<typeof result.current.register>;
    act(() => {
      binding = result.current.register("name", { rules: [{ required: true, message: "必填" }] });
    });
    await act(async () => {
      binding.onBlur();
    });
    expect(result.current.errors.name).toBe("必填");
  });

  it("字段联动：依赖字段变化时重校验已 touched 的从属字段", async () => {
    const { result } = renderHook(() => useForm({ initialValues: { pwd: "a", confirm: "a" } }));
    let confirmBinding!: ReturnType<typeof result.current.register>;
    act(() => {
      result.current.register("pwd");
      confirmBinding = result.current.register("confirm", {
        dependencies: ["pwd"],
        rules: [
          {
            validator: (v, values) => {
              if (v !== values.pwd) throw new Error("两次不一致");
            },
          },
        ],
      });
    });
    // 先 touch confirm（blur）→ 此刻一致，无错
    await act(async () => {
      confirmBinding.onBlur();
    });
    expect(result.current.errors.confirm).toBeUndefined();
    // 改 pwd → confirm 重校验 → 不一致报错（联动生效）
    await act(async () => {
      result.current.setFieldValue("pwd", "different");
    });
    expect(result.current.errors.confirm).toBe("两次不一致");
  });

  it("resetFields 还原值与错误", async () => {
    const { result } = renderHook(() => useForm({ initialValues: { name: "init" } }));
    act(() => {
      result.current.register("name", { rules: [{ required: true }] });
      result.current.setFieldValue("name", "changed");
    });
    await act(async () => {
      await result.current.validate();
    });
    act(() => {
      result.current.resetFields();
    });
    expect(result.current.values.name).toBe("init");
    expect(result.current.errors).toEqual({});
  });

  // #180：Field 的必填标记要能从规则派生，否则规则与标记两处各写一遍必然漂移。
  it("register 按 rules 派生 required（供 Field 画红星 + aria-required）", () => {
    const { result } = renderHook(() => useForm({ initialValues: { a: "", b: "", c: "" } }));
    expect(result.current.register("a", { rules: [{ required: true }] }).required).toBe(true);
    expect(result.current.register("b", { rules: [{ min: 6 }] }).required).toBe(false);
    expect(result.current.register("c").required).toBe(false);
  });
});

// ===== binding 的空值口径（#220）=====
//
// `register().value` 曾写作 `values[name] ?? ""`，于是 null 塌成空串：同一次渲染里
// form.values[name] 是 null、binding.value 是 ""，两处口径对不上。消费方拿 binding 驱动
// 受控控件是文档推荐用法，写了 `?? null` 也兜不住（`??` 只对 null/undefined 生效，空串直接
// 穿透），控件最终收到签名外的 ""。三态字段（null 沿用上级 / 0 显式为零 / 正整数覆盖）
// 因此丢掉 null 这一档 —— 而 null 与 0 是两个相反的业务结论。
describe("register().value 的空值口径（#220）", () => {
  it("null 原样穿透，且与 form.values 一致", () => {
    const { result } = renderHook(() => useForm({ initialValues: { quota: 5 as number | null } }));
    act(() => {
      result.current.register("quota").onChange(null);
    });
    expect(result.current.values.quota).toBeNull();
    expect(result.current.register("quota").value).toBeNull();
  });

  it("初始值就是 null 时也穿透（不只是改出来的 null）", () => {
    const { result } = renderHook(() => useForm({ initialValues: { quota: null } }));
    expect(result.current.register("quota").value).toBeNull();
  });

  it("0 与空串各自原样保留（三态字段的另外两档）", () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { quota: 0 as number | null, note: "" } }),
    );
    expect(result.current.register("quota").value).toBe(0);
    expect(result.current.register("note").value).toBe("");
  });

  // undefined 是「这个字段没有初始值」，不是一个业务值：直接交给受控控件会被 React 当成
  // 非受控，第一次输入就是「非受控 → 受控」的告警。这一档保持归一成 ""。
  it("未给初始值的字段仍归一成空串（避免受控/非受控切换）", () => {
    const { result } = renderHook(() => useForm({ initialValues: {} }));
    expect(result.current.register("never-set").value).toBe("");
  });

  // #343：编排件要靠它决定「关掉这张表单会不会丢东西」。
  describe("isDirty", () => {
    it("未改动是 false，改一个字段变 true，改回原值又是 false", () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: "甲", age: 1 } }));
      expect(result.current.isDirty()).toBe(false);
      act(() => result.current.setFieldValue("name", "乙"));
      expect(result.current.isDirty()).toBe(true);
      act(() => result.current.setFieldValue("name", "甲"));
      expect(result.current.isDirty()).toBe(false);
    });

    it("数组与对象比值不比引用（多选、级联每次 onChange 都是新引用）", () => {
      const { result } = renderHook(() =>
        useForm({ initialValues: { tags: ["a", "b"], area: { province: "粤" } } }),
      );
      act(() => result.current.setFieldValue("tags", ["a", "b"]));
      act(() => result.current.setFieldValue("area", { province: "粤" }));
      expect(result.current.isDirty()).toBe(false);
      act(() => result.current.setFieldValue("tags", ["a"]));
      expect(result.current.isDirty()).toBe(true);
    });

    it("新增初始值里没有的字段也算改动", () => {
      const { result } = renderHook(() => useForm({ initialValues: {} }));
      act(() => result.current.setFieldValue("note", "写了点东西"));
      expect(result.current.isDirty()).toBe(true);
    });

    it("resetFields 之后回到未改动", () => {
      const { result } = renderHook(() => useForm({ initialValues: { name: "甲" } }));
      act(() => result.current.setFieldValue("name", "乙"));
      act(() => result.current.resetFields());
      expect(result.current.isDirty()).toBe(false);
    });

    it("Date 比时间戳不比引用", () => {
      const day = new Date("2026-09-03T00:00:00Z");
      const { result } = renderHook(() => useForm({ initialValues: { at: day } }));
      act(() => result.current.setFieldValue("at", new Date("2026-09-03T00:00:00Z")));
      expect(result.current.isDirty()).toBe(false);
      act(() => result.current.setFieldValue("at", new Date("2026-09-04T00:00:00Z")));
      expect(result.current.isDirty()).toBe(true);
    });
  });
});
