import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("把 `<` 转义成 \\u003c —— 这是本函数存在的唯一理由", () => {
    expect(serializeJsonLd({ a: "<" })).toBe('{"a":"\\u003c"}');
  });

  it("数据里出现 </script> 时不会提前闭合脚本标签", () => {
    const out = serializeJsonLd({ description: "用 </script> 收尾的描述" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });

  it("转义后仍是合法 JSON，且解析回来与原值一致（\\u003c 是 JSON 转义，不改变语义）", () => {
    const data = { "@type": "TechArticle", headline: "a <b> c", nested: { list: ["</SCRIPT>", 1] } };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("不含 `<` 的常规数据逐字节等于 JSON.stringify", () => {
    const data = { "@context": "https://schema.org", name: "瑚琏 Hulian" };
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
