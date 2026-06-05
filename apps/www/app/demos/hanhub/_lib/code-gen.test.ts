import { describe, it, expect } from "vitest";
import { genCurl, genPython, genNode, genCode } from "./code-gen";

const input = {
  baseUrl: "https://api.hanhub.cn/v1",
  apiKey: "sk-hanhub-demo",
  model: "claude-opus-4-7",
  messages: [{ role: "user" as const, content: "你好" }],
  temperature: 0.7,
};

describe("genCurl", () => {
  it("带 Bearer 鉴权头与 model", () => {
    const s = genCurl(input);
    expect(s).toContain('Authorization: Bearer sk-hanhub-demo');
    expect(s).toContain("claude-opus-4-7");
    expect(s).toContain("chat/completions");
  });
});

describe("genPython", () => {
  it("用 OpenAI SDK + base_url", () => {
    const s = genPython(input);
    expect(s).toContain("from openai import OpenAI");
    expect(s).toContain('base_url="https://api.hanhub.cn/v1"');
    expect(s).toContain("temperature=0.7");
  });
});

describe("genNode", () => {
  it("用 openai npm + baseURL", () => {
    const s = genNode(input);
    expect(s).toContain('import OpenAI from "openai"');
    expect(s).toContain('baseURL: "https://api.hanhub.cn/v1"');
  });
});

describe("genCode", () => {
  it("按语言分发", () => {
    expect(genCode("curl", input)).toBe(genCurl(input));
    expect(genCode("python", input)).toBe(genPython(input));
    expect(genCode("node", input)).toBe(genNode(input));
  });
});
