import { Profiler } from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { CountrySelect } from "./country-select";
import { flagEmoji, filterCountries, getCountry, countrySearchText } from "./country-select.logic";
import { countries } from "./countries.data";

describe("countries 数据完整性", () => {
  it("约 250 国，code 唯一", () => {
    expect(countries.length).toBeGreaterThan(240);
    const codes = countries.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
  it("CN/US 区号规则正确（单后缀拼、多后缀=NANP 只取 root）", () => {
    expect(getCountry("CN")).toMatchObject({ cn: "中国", en: "China", dial: "+86" });
    expect(getCountry("US")?.dial).toBe("+1");
  });
});

describe("flagEmoji", () => {
  it("CN→🇨🇳、US→🇺🇸", () => {
    expect(flagEmoji("CN")).toBe("🇨🇳");
    expect(flagEmoji("us")).toBe("🇺🇸"); // 大小写不敏感
  });
  it("非两位字母返回空串", () => {
    expect(flagEmoji("C")).toBe("");
    expect(flagEmoji("123")).toBe("");
  });
});

describe("filterCountries（与 Combobox 内置过滤同口径）", () => {
  it("按 中文/英文/码/区号 任一匹配", () => {
    expect(filterCountries(countries, "中国").some((c) => c.code === "CN")).toBe(true);
    expect(filterCountries(countries, "china").some((c) => c.code === "CN")).toBe(true);
    expect(filterCountries(countries, "+86").some((c) => c.code === "CN")).toBe(true);
    expect(countrySearchText(getCountry("CN")!)).toContain("CN");
  });
  it("空 query 返回全部", () => {
    expect(filterCountries(countries, "").length).toBe(countries.length);
  });
});

describe("CountrySelect 组件", () => {
  it("单选渲染 placeholder", () => {
    const { getByText } = render(<CountrySelect placeholder="选国家" />);
    expect(getByText("选国家")).toBeTruthy();
  });
  it("单选默认值回显紧凑 label（旗+中文名）", () => {
    const { container } = render(<CountrySelect defaultValue="CN" />);
    expect(container.textContent).toContain("中国");
  });
  it("多选默认值渲染 chips", () => {
    const { container } = render(<CountrySelect multiple defaultValue={["CN", "US"]} />);
    expect(container.textContent).toContain("中国");
    expect(container.textContent).toContain("美国");
  });
  it("稳定父组件更新时跳过 CountrySelect 子树", async () => {
    const onRender = vi.fn();
    const { rerender } = render(
      <div data-parent-version="0">
        <Profiler id="country-select" onRender={onRender}>
          <CountrySelect placeholder="选国家" />
        </Profiler>
      </div>,
    );
    await act(async () => undefined);
    onRender.mockClear();
    rerender(
      <div data-parent-version="1">
        <Profiler id="country-select" onRender={onRender}>
          <CountrySelect placeholder="选国家" />
        </Profiler>
      </div>,
    );

    const update = onRender.mock.calls.at(-1);
    expect(update?.[1]).toBe("update");
    expect(update?.[2]).toBeLessThan(update?.[3] * 0.1);
  });
});
