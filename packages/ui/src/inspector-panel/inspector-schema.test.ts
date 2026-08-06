import { describe, it, expect } from "vitest";
import {
  MIXED,
  borderFields,
  colorFields,
  effectsFields,
  fieldTokens,
  formatLength,
  inspectorSections,
  isLiteralColor,
  isMixed,
  layoutFields,
  matchToken,
  parseLength,
  readInspectorValue,
  spacingSides,
  tokenColor,
  typographyFields,
} from "./inspector-schema";
import type { InspectorToken } from "./inspector-panel.types";

describe("MIXED", () => {
  it("跨模块同一哨兵（Symbol.for 全局注册）", () => {
    expect(MIXED).toBe(Symbol.for("hulian.inspector.mixed"));
  });
  it("isMixed 只认哨兵本身，不误伤同名字符串", () => {
    expect(isMixed(MIXED)).toBe(true);
    expect(isMixed("hulian.inspector.mixed")).toBe(false);
    expect(isMixed(undefined)).toBe(false);
  });
});

describe("readInspectorValue", () => {
  it("扁平键优先命中", () => {
    expect(readInspectorValue({ "style.color": "red" }, "style.color")).toBe("red");
  });
  it("扁平未命中时按点号下钻", () => {
    expect(readInspectorValue({ style: { color: "red" } }, "style.color")).toBe("red");
  });
  it("路径断链返回 undefined 而不是抛错", () => {
    expect(readInspectorValue({ style: null }, "style.color")).toBeUndefined();
    expect(readInspectorValue(undefined, "color")).toBeUndefined();
  });
  it("透传 MIXED 哨兵", () => {
    expect(readInspectorValue({ color: MIXED }, "color")).toBe(MIXED);
  });
  it("对象/数组这类不可编辑值按无值处理", () => {
    expect(readInspectorValue({ color: { r: 1 } }, "color")).toBeUndefined();
    expect(readInspectorValue({ color: [1, 2] }, "color")).toBeUndefined();
  });
  it("null 与 false 原样保留（false 是合法开关值）", () => {
    expect(readInspectorValue({ hidden: false }, "hidden")).toBe(false);
    expect(readInspectorValue({ color: null }, "color")).toBeNull();
  });
});

describe("spacingSides", () => {
  it("按 CSS-in-JS 驼峰派生四边", () => {
    expect(spacingSides("padding")).toEqual({
      top: "paddingTop",
      right: "paddingRight",
      bottom: "paddingBottom",
      left: "paddingLeft",
    });
  });
  it("可只覆盖其中一边，其余仍走派生", () => {
    expect(spacingSides("margin", { top: "gapY" })).toEqual({
      top: "gapY",
      right: "marginRight",
      bottom: "marginBottom",
      left: "marginLeft",
    });
  });
});

describe("parseLength / formatLength", () => {
  it("数字、纯数字串、带单位串都读成数字", () => {
    expect(parseLength(12)).toBe(12);
    expect(parseLength("12")).toBe(12);
    expect(parseLength("12px")).toBe(12);
    expect(parseLength("1.5rem")).toBe(1.5);
    expect(parseLength("-8px")).toBe(-8);
  });
  it("读不出的返回 null", () => {
    expect(parseLength("auto")).toBeNull();
    expect(parseLength("")).toBeNull();
    expect(parseLength(MIXED)).toBeNull();
    expect(parseLength(true)).toBeNull();
    expect(parseLength(Number.NaN)).toBeNull();
  });
  it("回吐形态只由 unit 决定", () => {
    expect(formatLength(12, "px")).toBe("12px");
    expect(formatLength(0.5)).toBe(0.5);
  });
});

describe("token", () => {
  const tokens: InspectorToken[] = [
    { token: "color-primary", label: "主色", group: "text" },
    { token: "color-danger", label: "危险", value: "oklch(0.6 0.2 25)", group: "text" },
    { token: "color-surface", label: "表面", group: "surface" },
    { token: "color-border", label: "边框" },
  ];

  it("tokenColor 优先字面值，否则回落 var(--token)", () => {
    expect(tokenColor(tokens[0])).toBe("var(--color-primary)");
    expect(tokenColor(tokens[1])).toBe("oklch(0.6 0.2 25)");
  });
  it("fieldTokens 按 group 过滤，未分组的 token 恒保留", () => {
    expect(fieldTokens(tokens, "surface").map((t) => t.token)).toEqual([
      "color-surface",
      "color-border",
    ]);
    expect(fieldTokens(tokens).length).toBe(4);
    expect(fieldTokens(undefined, "text")).toEqual([]);
  });
  it("matchToken 认字面值 / var(--x) / 裸 token 名三种写法", () => {
    expect(matchToken("var(--color-primary)", tokens)?.token).toBe("color-primary");
    expect(matchToken("oklch(0.6 0.2 25)", tokens)?.token).toBe("color-danger");
    expect(matchToken("color-border", tokens)?.token).toBe("color-border");
    expect(matchToken("#ff0000", tokens)).toBeUndefined();
    expect(matchToken(MIXED, tokens)).toBeUndefined();
  });
  it("isLiteralColor 挡住 var(--x)，只放行 ColorPicker 能解析的写法", () => {
    expect(isLiteralColor("#fff")).toBe(true);
    expect(isLiteralColor("rgb(1,2,3)")).toBe(true);
    expect(isLiteralColor("var(--color-primary)")).toBe(false);
    expect(isLiteralColor(MIXED)).toBe(false);
  });
});

describe("inspectorSections", () => {
  it("不传参给全部 5 类预设", () => {
    expect(inspectorSections().map((s) => s.id)).toEqual([
      "layout",
      "color",
      "typography",
      "border",
      "effects",
    ]);
  });
  it("按传入顺序过滤，未知 id 静默忽略", () => {
    expect(inspectorSections(["effects", "layout", "nope"]).map((s) => s.id)).toEqual([
      "effects",
      "layout",
    ]);
  });
  it("预设字段覆盖 6 种 kind（number 留给自定义 schema）", () => {
    const kinds = new Set(
      [
        ...layoutFields,
        ...colorFields,
        ...typographyFields,
        ...borderFields,
        ...effectsFields,
      ].map((f) => f.kind),
    );
    expect([...kinds].sort()).toEqual([
      "color",
      "enum",
      "length",
      "spacing",
      "text",
      "toggle",
    ]);
  });
  it("预设内不出现同 path 的重复字段（避免两处控件抢同一属性）", () => {
    const keys = [
      ...layoutFields,
      ...colorFields,
      ...typographyFields,
      ...borderFields,
      ...effectsFields,
    ].map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
