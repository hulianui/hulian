import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AvatarCircles } from "./avatar-circles";

const avatars = [
  { src: "/a.png", alt: "A" },
  { src: "/b.png", alt: "B" },
];

describe("AvatarCircles", () => {
  it("渲染每个头像 img", () => {
    const { getAllByRole } = render(<AvatarCircles avatars={avatars} />);
    expect(getAllByRole("img")).toHaveLength(2);
  });

  it("extraCount 渲染 +N 圆", () => {
    const { getByText } = render(<AvatarCircles avatars={avatars} extraCount={9} />);
    expect(getByText("+9")).toBeTruthy();
  });

  it("extraCount=0 不渲染 +N", () => {
    const { queryByText } = render(<AvatarCircles avatars={avatars} extraCount={0} />);
    expect(queryByText(/^\+/)).toBeNull();
  });

  it("第二个起带负 margin 叠压", () => {
    const { getAllByRole } = render(<AvatarCircles avatars={avatars} />);
    expect(getAllByRole("img")[1].className).toContain("-ml-3");
    expect(getAllByRole("img")[0].className).not.toContain("-ml-3");
  });

  it("透传 className", () => {
    const { container } = render(<AvatarCircles avatars={avatars} className="my-ac" />);
    expect(container.firstElementChild!.classList.contains("my-ac")).toBe(true);
  });
});
