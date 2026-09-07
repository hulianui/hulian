import type React from "react";
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
    expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
  });

  it("取消按钮触发关闭", () => {
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <ModalForm open title="t" onOpenChange={onOpenChange}>
        <div>body</div>
      </ModalForm>,
    );
    fireEvent.click(getByText("取消"));
    expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
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
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
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
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("有 form：填值校验通过则调 onFinish(values) 并关闭", async () => {
    const onFinish = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText, getByLabelText } = render(<FormHarness onFinish={onFinish} onOpenChange={onOpenChange} />);
    fireEvent.change(getByLabelText("name"), { target: { value: "张三" } });
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: "张三" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
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

// #343：编排件装的是表单，「关掉」不是无代价的动作。
describe("ModalForm 关闭守门", () => {
  function DirtyForm({
    onOpenChange,
    ...rest
  }: Partial<React.ComponentProps<typeof ModalForm>> & { onOpenChange?: (o: boolean) => void }) {
    const form = useForm({ initialValues: { name: "" } });
    return (
      <ModalForm open title="新增" form={form} onOpenChange={onOpenChange} {...rest}>
        <input
          aria-label="姓名"
          value={form.register("name").value as string}
          onChange={(e) => form.setFieldValue("name", e.target.value)}
        />
      </ModalForm>
    );
  }

  const esc = () => fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

  it("表单改过：按 Esc 弹确认，不直接关", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, findByText } = render(<DirtyForm onOpenChange={onOpenChange} />);
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    esc();
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("确认框点「放弃」才真的关", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, findByText, getByText } = render(<DirtyForm onOpenChange={onOpenChange} />);
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    esc();
    await findByText("放弃未提交的内容？");
    fireEvent.click(getByText("放弃"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, undefined));
  });

  it("确认框点「继续填写」不关，表单还在", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, findByText, getByText } = render(<DirtyForm onOpenChange={onOpenChange} />);
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    esc();
    await findByText("放弃未提交的内容？");
    fireEvent.click(getByText("继续填写"));
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
    expect(getByLabelText("姓名")).toBeTruthy();
  });

  it("表单没改过：直接关，不多问一句", async () => {
    const onOpenChange = vi.fn();
    const { queryByText } = render(<DirtyForm onOpenChange={onOpenChange} />);
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });

  it("confirmOnClose={false} 关掉这道守门", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText } = render(<DirtyForm onOpenChange={onOpenChange} confirmOnClose={false} />);
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
  });

  it("没传 form 时无从判断脏净，守门不生效", async () => {
    const onOpenChange = vi.fn();
    render(
      <ModalForm open title="t" onOpenChange={onOpenChange}>
        <div>body</div>
      </ModalForm>,
    );
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
  });

  it("提交成功的关闭不问「确定放弃」", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, getByText, queryByText } = render(
      <DirtyForm onOpenChange={onOpenChange} onFinish={() => {}} />,
    );
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, undefined));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });
});

// #351：`form` 只管得着 register 过的字段，弹窗里自持 state 的复合控件（区划级联、权限勾选组）
// 不在 form.values 里 —— 只改过它们就按 Esc，守门会判成干净表单不问就关。
describe("ModalForm 外部脏判定（hasExternalChanges）", () => {
  function Harness({
    withForm = true,
    ...rest
  }: Partial<React.ComponentProps<typeof ModalForm>> & { withForm?: boolean }) {
    const form = useForm({ initialValues: { name: "" } });
    return (
      <ModalForm open title="新增" form={withForm ? form : undefined} {...rest}>
        <input
          aria-label="姓名"
          value={form.register("name").value as string}
          onChange={(e) => form.setFieldValue("name", e.target.value)}
        />
      </ModalForm>
    );
  }

  const esc = () => fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

  it("不传：外部状态改到天上去也直接关，与此前逐字一致（回归钉）", async () => {
    const onOpenChange = vi.fn();
    const { queryByText } = render(<Harness onOpenChange={onOpenChange} />);
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });

  it("外部脏：按 Esc 先问一句，不直接关", async () => {
    const onOpenChange = vi.fn();
    const { findByText } = render(
      <Harness onOpenChange={onOpenChange} hasExternalChanges={() => true} />,
    );
    esc();
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("外部脏：点右上角关闭键也问", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, findByText } = render(
      <Harness onOpenChange={onOpenChange} hasExternalChanges={() => true} />,
    );
    fireEvent.click(getByLabelText("关闭"));
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("外部干净且表单没改过：直接关，不多问一句", async () => {
    const onOpenChange = vi.fn();
    const { queryByText } = render(
      <Harness onOpenChange={onOpenChange} hasExternalChanges={() => false} />,
    );
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });

  it("与 form.isDirty() 取或：form 脏、外部干净照样问", async () => {
    const onOpenChange = vi.fn();
    const { getByLabelText, findByText } = render(
      <Harness onOpenChange={onOpenChange} hasExternalChanges={() => false} />,
    );
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    esc();
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("没传 form 时也能单独用这一侧", async () => {
    const onOpenChange = vi.fn();
    const { findByText } = render(
      <Harness withForm={false} onOpenChange={onOpenChange} hasExternalChanges={() => true} />,
    );
    esc();
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });

  it("惰性求值：不关就不问它，真要关那一刻才调", () => {
    const hasExternalChanges = vi.fn(() => true);
    render(<Harness hasExternalChanges={hasExternalChanges} />);
    // 渲染期不问：这一侧多数时候没人看，不该逼消费方每帧比一次快照。
    expect(hasExternalChanges).not.toHaveBeenCalled();
    esc();
    expect(hasExternalChanges).toHaveBeenCalled();
  });

  it("提交成功的关闭不问「确定放弃」（既有语义没破）", async () => {
    const onOpenChange = vi.fn();
    const { getByText, queryByText } = render(
      <Harness onOpenChange={onOpenChange} onFinish={() => {}} hasExternalChanges={() => true} />,
    );
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, undefined));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });

  it("confirmOnClose={false} 把两侧一并关掉", async () => {
    const onOpenChange = vi.fn();
    const { queryByText } = render(
      <Harness onOpenChange={onOpenChange} confirmOnClose={false} hasExternalChanges={() => true} />,
    );
    esc();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
    expect(queryByText("放弃未提交的内容？")).toBeNull();
  });

  it("DrawerForm 共用同一道守门", async () => {
    const onOpenChange = vi.fn();
    const { findByText } = render(
      <DrawerForm open title="新增" onOpenChange={onOpenChange} hasExternalChanges={() => true}>
        <div>body</div>
      </DrawerForm>,
    );
    esc();
    expect(await findByText("放弃未提交的内容？")).toBeTruthy();
    expect(onOpenChange.mock.calls.some(([open]) => open === false)).toBe(false);
  });
});
