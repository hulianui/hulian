import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BeianFooter } from "./beian-footer";

describe("BeianFooter", () => {
  it("渲染多个 ICP 备案号且默认链向 miit", () => {
    const { getByText } = render(
      <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }]} />,
    );
    const a = getByText("闽ICP备2024073556号-1").closest("a")!;
    expect(a.getAttribute("href")).toContain("beian.miit.gov.cn");
    expect(getByText("闽ICP备2024073556号-2")).toBeTruthy();
  });

  it("公网安备默认链向 mps 且新窗打开", () => {
    const { getByText } = render(<BeianFooter police={{ number: "闽公网安备35030302900030号" }} />);
    const a = getByText("闽公网安备35030302900030号").closest("a")!;
    expect(a.getAttribute("href")).toContain("beian.mps.gov.cn");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noreferrer");
  });

  it("自定义 href 覆盖默认", () => {
    const { getByText } = render(<BeianFooter icp={[{ number: "x", href: "https://example.com" }]} />);
    expect(getByText("x").closest("a")!.getAttribute("href")).toBe("https://example.com");
  });

  it("无 icp / police 时不渲染对应行，copyright 可选渲染", () => {
    const { queryByText, getByText } = render(<BeianFooter copyright="© 2026 瑚琏" />);
    expect(queryByText("ICP备案")).toBeNull();
    expect(getByText("© 2026 瑚琏")).toBeTruthy();
  });
});
