import { describe, expect, it } from "vitest";
import { validateValue, type FormRule } from "./rules";

describe("validateValue 规则引擎", () => {
  it("required：空值报必填，有值通过", async () => {
    const rules: FormRule[] = [{ required: true }];
    expect(await validateValue("", rules)).toBe("此项为必填项");
    expect(await validateValue("  ", rules)).toBe("此项为必填项");
    expect(await validateValue(undefined, rules)).toBe("此项为必填项");
    expect(await validateValue([], rules)).toBe("此项为必填项");
    expect(await validateValue("有值", rules)).toBeNull();
  });

  it("required 自定义 message", async () => {
    expect(await validateValue("", [{ required: true, message: "请填写邮箱" }])).toBe("请填写邮箱");
  });

  it("pattern：仅对字符串生效，不匹配报错", async () => {
    const rules: FormRule[] = [{ pattern: /^\d+$/, message: "只能是数字" }];
    expect(await validateValue("abc", rules)).toBe("只能是数字");
    expect(await validateValue("123", rules)).toBeNull();
  });

  it("非必填且空值 → 跳过 pattern/长度校验", async () => {
    const rules: FormRule[] = [{ pattern: /^\d+$/ }, { min: 3 }];
    expect(await validateValue("", rules)).toBeNull();
  });

  it("min/max：字符串按长度", async () => {
    expect(await validateValue("ab", [{ min: 3 }])).toBe("至少 3 个字符");
    expect(await validateValue("abcd", [{ max: 3 }])).toBe("最多 3 个字符");
    expect(await validateValue("abc", [{ min: 3, max: 3 }])).toBeNull();
  });

  it("min/max：数字按数值", async () => {
    expect(await validateValue(2, [{ min: 3 }])).toBe("不能小于 3");
    expect(await validateValue(10, [{ max: 5 }])).toBe("不能大于 5");
    expect(await validateValue(4, [{ min: 3, max: 5 }])).toBeNull();
  });

  it("async validator：reject/throw 的 message 作错误", async () => {
    const rules: FormRule[] = [
      {
        validator: async (v) => {
          if (v === "taken") throw new Error("用户名已被占用");
        },
      },
    ];
    expect(await validateValue("taken", rules)).toBe("用户名已被占用");
    expect(await validateValue("free", rules)).toBeNull();
  });

  it("validator 可读其他字段值（跨字段校验）", async () => {
    const rules: FormRule[] = [
      {
        validator: (v, values) => {
          if (v !== values.password) throw new Error("两次密码不一致");
        },
      },
    ];
    expect(await validateValue("a", rules, { password: "b" })).toBe("两次密码不一致");
    expect(await validateValue("a", rules, { password: "a" })).toBeNull();
  });

  it("多规则按序短路：返回首个错误", async () => {
    const rules: FormRule[] = [{ required: true, message: "必填" }, { min: 5, message: "太短" }];
    expect(await validateValue("", rules)).toBe("必填");
    expect(await validateValue("ab", rules)).toBe("太短");
    expect(await validateValue("abcde", rules)).toBeNull();
  });
});
