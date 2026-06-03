import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { User } from "./user";

describe("User", () => {
  it("渲染名称", () => {
    const { getByText } = render(<User name="瑚琏" />);
    expect(getByText("瑚琏")).toBeTruthy();
  });

  it("渲染描述", () => {
    const { getByText } = render(<User name="瑚琏" description="设计系统" />);
    expect(getByText("设计系统")).toBeTruthy();
  });

  it("无 description 不渲染次级行", () => {
    const { queryByText } = render(<User name="瑚琏" />);
    expect(queryByText("设计系统")).toBeNull();
  });

  it("avatarProps.fallback 透传到 Avatar", () => {
    const { getByText } = render(<User name="李四" avatarProps={{ fallback: "李" }} />);
    expect(getByText("李")).toBeTruthy();
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<User name="x" className="my-user" />);
    expect(container.firstElementChild!.classList.contains("my-user")).toBe(true);
  });
});
