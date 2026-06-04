import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "../form/use-form";
import { ModalForm, DrawerForm } from "./form-dialog";

describe("ModalForm", () => {
  it("受控 open 渲染标题/内容/提交取消按钮", () => {
    const { getByText } = render(
      <ModalForm open title="新增员工" onFinish={() => {}}>
        <div>表单内容</div>
      </ModalForm>,
    );
    expect(getByText("新增员工")).toBeTruthy();
    expect(getByText("表单内容")).toBeTruthy();
    expect(getByText("提交")).toBeTruthy();
    expect(getByText("取消")).toBeTruthy();
  });

  it("无 form：提交调 onFinish({}) 并关闭", async () => {
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <ModalForm open title="t" onFinish={onFinish} onOpenChange={onOpenChange}>
        <div>body</div>
      </ModalForm>,
    );
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({}));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("取消按钮触发关闭", () => {
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <ModalForm open title="t" onOpenChange={onOpenChange}>
        <div>body</div>
      </ModalForm>,
    );
    fireEvent.click(getByText("取消"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("onFinish 返回 false：保持打开（不触发关闭）", async () => {
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <ModalForm open title="t" onFinish={() => false} onOpenChange={onOpenChange}>
        <div>body</div>
      </ModalForm>,
    );
    fireEvent.click(getByText("提交"));
    await waitFor(() => {});
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("submitText / cancelText 覆盖文案", () => {
    const { getByText } = render(
      <ModalForm open title="t" submitText="保存" cancelText="关闭">
        <div>body</div>
      </ModalForm>,
    );
    expect(getByText("保存")).toBeTruthy();
    expect(getByText("关闭")).toBeTruthy();
  });

  function FormHarness({ onFinish, onOpenChange }: { onFinish: (v: unknown) => void; onOpenChange: (o: boolean) => void }) {
    const form = useForm({ initialValues: { name: "" } });
    const name = form.register("name", { rules: [{ required: true, message: "必填" }] });
    return (
      <ModalForm open title="t" form={form} onFinish={onFinish} onOpenChange={onOpenChange}>
        <input aria-label="name" value={name.value as string} onChange={name.onChange} />
      </ModalForm>
    );
  }

  it("有 form：校验不过则拦截（不调 onFinish、不关闭）", async () => {
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(<FormHarness onFinish={onFinish} onOpenChange={onOpenChange} />);
    fireEvent.click(getByText("提交"));
    await waitFor(() => {});
    expect(onFinish).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("有 form：填值校验通过则调 onFinish(values) 并关闭", async () => {
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText, getByLabelText } = render(<FormHarness onFinish={onFinish} onOpenChange={onOpenChange} />);
    fireEvent.change(getByLabelText("name"), { target: { value: "张三" } });
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: "张三" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("DrawerForm", () => {
  it("受控 open 渲染标题/内容/按钮", () => {
    const { getByText } = render(
      <DrawerForm open title="抽屉表单" side="right" onFinish={() => {}}>
        <div>抽屉内容</div>
      </DrawerForm>,
    );
    expect(getByText("抽屉内容")).toBeTruthy();
    expect(getByText("提交")).toBeTruthy();
  });
});
