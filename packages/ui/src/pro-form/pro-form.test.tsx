import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "../form/use-form";
import { ProForm } from "./pro-form";

describe("ProForm", () => {
  it("无 form：渲染提交按钮、无重置（需 form）", () => {
    const { getByText, queryByText } = render(
      <ProForm onFinish={() => {}}>
        <div>body</div>
      </ProForm>,
    );
    expect(getByText("提交")).toBeTruthy();
    expect(queryByText("重置")).toBeNull();
  });

  it("无 form：提交调 onFinish({})", async () => {
    const onFinish = vi.fn();
    const { getByText } = render(
      <ProForm onFinish={onFinish}>
        <div>body</div>
      </ProForm>,
    );
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({}));
  });

  function Harness({ onFinish }: { onFinish: (v: unknown) => void }) {
    const form = useForm({ initialValues: { name: "" } });
    const name = form.register("name", { rules: [{ required: true, message: "必填" }] });
    return (
      <ProForm form={form} onFinish={onFinish}>
        <input aria-label="name" value={name.value as string} onChange={name.onChange} />
      </ProForm>
    );
  }

  it("有 form：渲染重置按钮", () => {
    const { getByText } = render(<Harness onFinish={() => {}} />);
    expect(getByText("重置")).toBeTruthy();
  });

  it("有 form：校验不过则拦截提交", async () => {
    const onFinish = vi.fn();
    const { getByText } = render(<Harness onFinish={onFinish} />);
    fireEvent.click(getByText("提交"));
    await waitFor(() => {});
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("有 form：填值校验通过则提交 values", async () => {
    const onFinish = vi.fn();
    const { getByText, getByLabelText } = render(<Harness onFinish={onFinish} />);
    fireEvent.change(getByLabelText("name"), { target: { value: "张三" } });
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: "张三" }));
  });

  it("重置按钮清空字段", () => {
    const { getByText, getByLabelText } = render(<Harness onFinish={() => {}} />);
    const input = getByLabelText("name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "x" } });
    expect(input.value).toBe("x");
    fireEvent.click(getByText("重置"));
    expect(input.value).toBe("");
  });

  it("自定义 footer 覆盖默认按钮", () => {
    const { getByText, queryByText } = render(
      <ProForm footer={<div>自定义底部</div>}>
        <div>body</div>
      </ProForm>,
    );
    expect(getByText("自定义底部")).toBeTruthy();
    expect(queryByText("提交")).toBeNull();
  });
});
