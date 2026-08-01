import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("渲染默认标题/账号密码字段/记住我/登录按钮", () => {
    const { getByText, getAllByText, getByLabelText } = render(<LoginForm />);
    expect(getAllByText("登录").length).toBeGreaterThanOrEqual(2); // 标题 + 按钮
    expect(getByLabelText("账号")).toBeTruthy();
    expect(getByLabelText("密码")).toBeTruthy();
    expect(getByText("记住我")).toBeTruthy();
  });

  it("密码字段为 password 类型", () => {
    const { getByLabelText } = render(<LoginForm />);
    expect((getByLabelText("密码") as HTMLInputElement).type).toBe("password");
  });

  it("空提交：校验拦截，onFinish 不调用", async () => {
    const onFinish = vi.fn();
    const { getAllByText } = render(<LoginForm onFinish={onFinish} />);
    // 「登录」既是标题也是按钮文本 → 取按钮(type=submit)
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => {});
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("填账号密码后提交：onFinish 拿到值", async () => {
    const onFinish = vi.fn();
    const { getByLabelText, getAllByText } = render(<LoginForm onFinish={onFinish} />);
    fireEvent.change(getByLabelText("账号"), { target: { value: "admin" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "secret" } });
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() =>
      expect(onFinish).toHaveBeenCalledWith({ username: "admin", password: "secret", remember: false }),
    );
  });

  it("勾选记住我后提交带 remember=true", async () => {
    const onFinish = vi.fn();
    const { getByLabelText, getByText, getAllByText } = render(<LoginForm onFinish={onFinish} />);
    fireEvent.change(getByLabelText("账号"), { target: { value: "a" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "b" } });
    fireEvent.click(getByText("记住我"));
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() =>
      expect(onFinish).toHaveBeenCalledWith({ username: "a", password: "b", remember: true }),
    );
  });

  it("showRemember=false 不渲染记住我", () => {
    const { queryByText } = render(<LoginForm showRemember={false} />);
    expect(queryByText("记住我")).toBeNull();
  });

  it("title 覆盖标题", () => {
    const { getByText } = render(<LoginForm title="后台登录" />);
    expect(getByText("后台登录")).toBeTruthy();
  });

  it("rules：格式不合法时拦截提交并出错误文案", async () => {
    const onFinish = vi.fn();
    const { getByLabelText, getByText, getAllByText } = render(
      <LoginForm
        onFinish={onFinish}
        rules={{ username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号格式不正确" }] }}
      />,
    );
    fireEvent.change(getByLabelText("账号"), { target: { value: "1" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "secret" } });
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => expect(getByText("账号格式不正确")).toBeTruthy());
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("rules：内置必填仍先于自定义规则生效", async () => {
    const { getByText, getAllByText } = render(
      <LoginForm rules={{ username: [{ pattern: /^[a-z]+$/, message: "账号格式不正确" }] }} />,
    );
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => expect(getByText("请输入账号")).toBeTruthy());
  });

  it("非受控也能通过 onValuesChange 观察实时值", () => {
    const onValuesChange = vi.fn();
    const { getByLabelText } = render(<LoginForm onValuesChange={onValuesChange} />);
    fireEvent.change(getByLabelText("账号"), { target: { value: "ad" } });
    expect(onValuesChange).toHaveBeenCalledWith(
      { username: "ad" },
      { username: "ad", password: "", remember: false },
    );
  });

  it("受控：外部 values 驱动输入框显示，输入回调后回写生效", () => {
    function Controlled() {
      const [values, setValues] = useState({ username: "seed", password: "", remember: false });
      return <LoginForm values={values} onValuesChange={(_c, all) => setValues(all)} />;
    }
    const { getByLabelText } = render(<Controlled />);
    const username = getByLabelText("账号") as HTMLInputElement;
    expect(username.value).toBe("seed");
    fireEvent.change(username, { target: { value: "admin" } });
    expect((getByLabelText("账号") as HTMLInputElement).value).toBe("admin");
  });

  it("受控：外部改值不再重复冒泡 onValuesChange", async () => {
    const onValuesChange = vi.fn();
    function Controlled() {
      const [values, setValues] = useState({ username: "a", password: "", remember: false });
      return (
        <>
          <button type="button" onClick={() => setValues((v) => ({ ...v, username: "outside" }))}>
            外部改值
          </button>
          <LoginForm
            values={values}
            onValuesChange={(c, all) => {
              onValuesChange(c, all);
              setValues(all);
            }}
          />
        </>
      );
    }
    const { getByText, getByLabelText } = render(<Controlled />);
    fireEvent.click(getByText("外部改值"));
    await waitFor(() => expect((getByLabelText("账号") as HTMLInputElement).value).toBe("outside"));
    expect(onValuesChange).not.toHaveBeenCalled();
  });

  it("beforeSubmit：先于 onFinish 执行且拿到 values", async () => {
    const calls: string[] = [];
    const onFinish = vi.fn(() => {
      calls.push("finish");
    });
    const beforeSubmit = vi.fn(() => {
      calls.push("before");
    });
    const { getByLabelText, getAllByText } = render(
      <LoginForm beforeSubmit={beforeSubmit} onFinish={onFinish} />,
    );
    fireEvent.change(getByLabelText("账号"), { target: { value: "a" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "b" } });
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(calls).toEqual(["before", "finish"]);
    expect(beforeSubmit).toHaveBeenCalledWith({ username: "a", password: "b", remember: false });
  });

  it("beforeSubmit 返回 false：中止提交", async () => {
    const onFinish = vi.fn();
    const { getByLabelText, getAllByText } = render(
      <LoginForm beforeSubmit={() => false} onFinish={onFinish} />,
    );
    fireEvent.change(getByLabelText("账号"), { target: { value: "a" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "b" } });
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => {});
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("beforeSubmit 抛错：中止提交且不冒泡", async () => {
    const onFinish = vi.fn();
    const { getByLabelText, getAllByText } = render(
      <LoginForm
        beforeSubmit={() => {
          throw new Error("验证码取消");
        }}
        onFinish={onFinish}
      />,
    );
    fireEvent.change(getByLabelText("账号"), { target: { value: "a" } });
    fireEvent.change(getByLabelText("密码"), { target: { value: "b" } });
    const submit = getAllByText("登录").map((el) => el.closest("button")).find(Boolean) as HTMLButtonElement;
    fireEvent.click(submit);
    await waitFor(() => {});
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("extra：渲染在密码与记住我之间", () => {
    const { getByTestId } = render(<LoginForm extra={<div data-testid="captcha-slot">验证码</div>} />);
    expect(getByTestId("captcha-slot")).toBeTruthy();
  });
});
