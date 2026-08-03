import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPONENT_RECENT_STORAGE_KEY,
  ComponentQuickJump,
  findExactComponent,
} from "./component-quick-jump";
import { basePathForLocale, stripDocsBasePath } from "../lib/docs-locale";

// 语言前缀取自 SSOT：根语言为空串，嵌套语言带前缀。不写字面量。
const EN = basePathForLocale("en");
const ZH = basePathForLocale("zh-CN");

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("findExactComponent", () => {
  it.each(["Button", "按钮", "button", "BuTtOn"])(
    "resolves the unique exact component identity %s",
    (query) => {
      expect(findExactComponent(query)?.id).toBe("component:button");
    },
  );

  it.each(["ModalForm", "DrawerForm"])(
    "resolves the canonical secondary public export %s",
    (query) => {
      expect(findExactComponent(query)?.id).toBe("component:form-dialog");
    },
  );

  it("does not call an ambiguous alias an exact result", () => {
    expect(findExactComponent("animated")).toBeNull();
  });

  it("does not treat a unique group label as an exact component identity", () => {
    expect(findExactComponent("引导")).toBeNull();
  });
});

describe("ComponentQuickJump", () => {
  beforeEach(() => {
    push.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates a unique exact name on Enter without requiring a highlighted row", () => {
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "BuTtOn" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/components/button");
  });

  it("navigates a canonical secondary public export on Enter", () => {
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "DrawerForm" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/components/form-dialog");
  });

  it("requires a highlighted result for ambiguous fuzzy input", () => {
    render(<ComponentQuickJump placement="home" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "animated" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const highlighted = screen
      .getAllByRole("option")
      .find((option) => option.getAttribute("aria-selected") === "true");
    expect(highlighted).toBeDefined();

    const href = highlighted?.getAttribute("href");
    fireEvent.keyDown(input, { key: "Enter" });
    // anchor 上是**本地化**的 href（SSR 与原生点击要能直接用），而 router.push 收到的是
    // 剥掉语言前缀的裸路径 —— Next 的 router 会自己补当前构建的 basePath，不剥就成双前缀。
    // 旧布局下中文前缀是空串，两者恰好相等，这条断言才一直是 toHaveBeenCalledWith(href)。
    expect(push).toHaveBeenCalledWith(stripDocsBasePath(href!));
  });

  it("does not immediately navigate a unique generic group match on Enter", () => {
    render(<ComponentQuickJump placement="home" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "引导" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("option", { name: /漫游引导.*tour/i })).toBeTruthy();
  });

  it("supports ArrowDown and Escape while retaining combobox semantics", () => {
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "button" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("teaches the empty state with popular and safely stored recent shortcuts", () => {
    window.localStorage.setItem(COMPONENT_RECENT_STORAGE_KEY, JSON.stringify(["input", "button"]));

    render(<ComponentQuickJump placement="catalog" />);

    expect(screen.getByText("最近访问")).toBeTruthy();
    expect(screen.getByText("常用组件")).toBeTruthy();
    expect(screen.getAllByRole("option").length).toBeGreaterThanOrEqual(3);
    expect(
      screen
        .getAllByRole("option")
        // option 是原生 anchor，href 带该语种的前缀（默认构建是中文）。
        .some((option) => option.getAttribute("href") === `${ZH}/components/input`),
    ).toBe(true);
  });

  it("does not let storage failures block component navigation", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    render(<ComponentQuickJump placement="catalog" />);

    const input = screen.getByRole("combobox", { name: "快速跳转组件" });
    fireEvent.change(input, { target: { value: "button" } });
    expect(() => fireEvent.keyDown(input, { key: "Enter" })).not.toThrow();
    expect(push).toHaveBeenCalledWith("/components/button");
  });

  it("emits localized component hrefs in server-rendered markup", () => {
    const html = renderToStaticMarkup(<ComponentQuickJump placement="catalog" />);

    expect(html).toContain(`href="${ZH}/components/button"`);
    // 双前缀防回归；前缀为空串时该检查会退化成 href="/"（页面必有），故仅在非空时断言。
    if (ZH) expect(html).not.toContain(`href="${ZH}${ZH}/`);
  });

  it("renders exactly one English base path from a fresh locale module graph", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    try {
      const { ComponentQuickJump: EnglishQuickJump } = await import("./component-quick-jump");
      const html = renderToStaticMarkup(<EnglishQuickJump placement="catalog" />);

      expect(html).toContain(`href="${EN}/components/button"`);
      if (EN) expect(html).not.toContain(`href="${EN}${EN}/`);
      // 英文产物里不该混进另一个语种的地址（与谁挂根路径无关，恒有效）。
      expect(html).not.toContain(`href="${ZH}/`);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it("navigates the canonical Chinese short name on Enter in the English build", async () => {
    vi.resetModules();
    vi.stubEnv("DOCS_LOCALE", "en");
    try {
      const { ComponentQuickJump: EnglishQuickJump } = await import("./component-quick-jump");
      render(<EnglishQuickJump placement="catalog" />);

      const input = screen.getByRole("combobox", { name: "Quick jump to a component" });
      fireEvent.change(input, { target: { value: "按钮" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(push).toHaveBeenCalledWith("/components/button");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
