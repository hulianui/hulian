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
});
