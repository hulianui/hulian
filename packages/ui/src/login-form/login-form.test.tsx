import { describe, it, expect, vi } from "vitest";
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
});
