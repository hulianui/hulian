import ts from "typescript-api";
import { describe, expect, it } from "vitest";
import { content as conversations } from "./conversations.content";
import { content as page } from "./page.content";
import { content as stream } from "./use-chat-stream.content";
import { CONVERSATION_GROUPS } from "./conversations";
import { selectEnglishScriptId } from "./use-chat-stream";

const cjk = /[\p{Script=Han}，。！？；：、“”‘’（）【】《》〈〉「」『』…]/u;

describe("AI chat English content", () => {
  it("keeps canonical conversation group values while exposing complete English copy", () => {
    expect(CONVERSATION_GROUPS).toEqual(["今天", "昨天", "7 天内"]);
    for (const dictionary of [conversations, page, stream]) {
      expect(Object.keys(dictionary.en)).toEqual(Object.keys(dictionary["zh-CN"]));
      expect(Object.values(dictionary.en).some((value) => cjk.test(value))).toBe(false);
    }
    expect(page.en.coralAssistants).toBe("Hulian Assistant");
    expect(page.en.toDeleteAConversation).toBe("Delete conversation: {0}");
  });

  it("keeps displayed tool payloads valid JSON and the code answer valid JavaScript", () => {
    expect(JSON.parse(stream.en.weatherInput)).toEqual({ city: "Beijing", unit: "celsius" });
    expect(JSON.parse(stream.en.weatherOutput)).toMatchObject({ temp: 21, humidity: "45%" });
    const code = stream.en.codeAnswer.match(/```js\n([\s\S]+?)\n```/)?.[1];
    expect(code).toBeTruthy();
    const result = ts.transpileModule(code!, { reportDiagnostics: true });
    expect(
      result.diagnostics?.filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      ) ?? [],
    ).toEqual([]);
  });

  it("routes English suggestions to the matching local stream script", () => {
    expect(selectEnglishScriptId("How's the weather in Beijing today?")).toBe("weather");
    expect(selectEnglishScriptId("Write a quick sort for me")).toBe("code");
    expect(selectEnglishScriptId("Explain what a closure is")).toBe("explain");
    expect(selectEnglishScriptId("What can you do?")).toBe("fallback");
  });
});
