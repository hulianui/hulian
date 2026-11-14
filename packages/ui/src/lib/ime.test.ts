import { describe, expect, it } from "vitest";
import { isImeComposing } from "./ime";

describe("isImeComposing", () => {
  it("isComposing=true（Chrome/Firefox 合成中）→ true", () => {
    expect(isImeComposing({ nativeEvent: new KeyboardEvent("keydown", { key: "Enter", isComposing: true }) })).toBe(true);
  });
  it("keyCode 229（Safari 合成确认键，isComposing 已复位）→ true", () => {
    expect(isImeComposing({ nativeEvent: new KeyboardEvent("keydown", { key: "Enter", keyCode: 229 }) })).toBe(true);
  });
  it("普通 Enter → false", () => {
    expect(isImeComposing({ nativeEvent: new KeyboardEvent("keydown", { key: "Enter", keyCode: 13 }) })).toBe(false);
  });
  it("直接传原生事件也可用", () => {
    expect(isImeComposing(new KeyboardEvent("keydown", { key: "Enter", isComposing: true }))).toBe(true);
  });
});
