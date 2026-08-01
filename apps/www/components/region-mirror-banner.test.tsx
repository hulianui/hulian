import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { parseCfLoc, RegionMirrorBanner } from "./region-mirror-banner";

describe("parseCfLoc", () => {
  const trace = [
    "fl=123abc",
    "ip=1.2.3.4",
    "ts=1700000000.123",
    "visit_scheme=https",
    "loc=CN",
    "tls=TLSv1.3",
  ].join("\n");

  it("从标准 trace 文本里取出国家码", () => {
    expect(parseCfLoc(trace)).toBe("CN");
  });

  it("国家码统一大写", () => {
    expect(parseCfLoc("loc=us")).toBe("US");
  });

  it("容忍前后空白与 \\r\\n", () => {
    expect(parseCfLoc("ip=1.1.1.1\r\nloc= JP \r\n")).toBe("JP");
  });

  it("没有 loc 行返回 null", () => {
    expect(parseCfLoc("ip=1.2.3.4\nts=1700000000")).toBeNull();
  });

  it("loc 为空返回 null", () => {
    expect(parseCfLoc("loc=")).toBeNull();
  });

  it("不把 colo 之类含 loc 的键误判（精确匹配键名）", () => {
    expect(parseCfLoc("colo=SJC\nsliver=none")).toBeNull();
  });
});

describe("RegionMirrorBanner", () => {
  const MAIN = "hulianui.haloritual.com";

  function stubLocation(hostname: string, pathname = "/", search = "", hash = "") {
    Object.defineProperty(window, "location", {
      value: { hostname, pathname, search, hash },
      writable: true,
      configurable: true,
    });
  }

  function stubTrace(loc: string) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(`ip=1.1.1.1\nloc=${loc}\n`) }),
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("主站 + CN 访客：显示横幅，切换链接指向镜像同路径", async () => {
    stubLocation(MAIN, "/components/button", "?x=1", "#api");
    stubTrace("CN");
    const { findByText, getByText } = render(<RegionMirrorBanner />);
    await findByText(/访问镜像站点更快/);
    const link = getByText("切换到镜像 →").closest("a");
    expect(link?.getAttribute("href")).toBe(
      "https://hulianui-zh.haloritual.com/components/button?x=1#api",
    );
  });

  it("英文页切到镜像时保留 /en、查询与锚点", async () => {
    stubLocation(MAIN, "/en/components/button", "?q=x", "#api");
    stubTrace("CN");
    const { findByText, getByText } = render(<RegionMirrorBanner />);
    await findByText(/访问镜像站点更快/);

    expect(getByText("切换到镜像 →").closest("a")?.getAttribute("href")).toBe(
      "https://hulianui-zh.haloritual.com/en/components/button?q=x#api",
    );
  });

  it("非 CN 访客：不显示", async () => {
    stubLocation(MAIN, "/");
    stubTrace("US");
    const { container } = render(<RegionMirrorBanner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.textContent).not.toContain("访问镜像站点更快");
  });

  it("非主站（镜像/本地）：根本不探测", () => {
    stubLocation("hulianui-zh.haloritual.com", "/");
    stubTrace("CN");
    render(<RegionMirrorBanner />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("关闭后写入 localStorage 且横幅消失", async () => {
    stubLocation(MAIN, "/");
    stubTrace("CN");
    const { findByText, getByLabelText, queryByText } = render(<RegionMirrorBanner />);
    await findByText(/访问镜像站点更快/);
    fireEvent.click(getByLabelText("不再提示"));
    expect(localStorage.getItem("hl-mirror-banner-dismissed")).toBe("1");
    expect(queryByText(/访问镜像站点更快/)).toBeNull();
  });

  it("已关闭过：不再探测、不显示", () => {
    localStorage.setItem("hl-mirror-banner-dismissed", "1");
    stubLocation(MAIN, "/");
    stubTrace("CN");
    render(<RegionMirrorBanner />);
    expect(fetch).not.toHaveBeenCalled();
  });
});
