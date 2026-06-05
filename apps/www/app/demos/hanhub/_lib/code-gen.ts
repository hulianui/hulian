// 由 Playground 参数生成多语言接入片段（curl / python / node）。纯函数，可测。

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CodeGenInput {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export function genCurl(i: CodeGenInput): string {
  const body = {
    model: i.model,
    messages: i.messages,
    ...(i.temperature != null ? { temperature: i.temperature } : {}),
    ...(i.maxTokens != null ? { max_tokens: i.maxTokens } : {}),
  };
  return [
    `curl ${i.baseUrl}/chat/completions \\`,
    `  -H "Authorization: Bearer ${i.apiKey}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${JSON.stringify(body)}'`,
  ].join("\n");
}

export function genPython(i: CodeGenInput): string {
  return [
    `from openai import OpenAI`,
    ``,
    `client = OpenAI(`,
    `    base_url="${i.baseUrl}",`,
    `    api_key="${i.apiKey}",`,
    `)`,
    ``,
    `resp = client.chat.completions.create(`,
    `    model="${i.model}",`,
    `    messages=${pyMessages(i.messages)},`,
    ...(i.temperature != null ? [`    temperature=${i.temperature},`] : []),
    ...(i.maxTokens != null ? [`    max_tokens=${i.maxTokens},`] : []),
    `)`,
    `print(resp.choices[0].message.content)`,
  ].join("\n");
}

export function genNode(i: CodeGenInput): string {
  return [
    `import OpenAI from "openai";`,
    ``,
    `const client = new OpenAI({`,
    `  baseURL: "${i.baseUrl}",`,
    `  apiKey: "${i.apiKey}",`,
    `});`,
    ``,
    `const resp = await client.chat.completions.create({`,
    `  model: "${i.model}",`,
    `  messages: ${JSON.stringify(i.messages)},`,
    ...(i.temperature != null ? [`  temperature: ${i.temperature},`] : []),
    ...(i.maxTokens != null ? [`  max_tokens: ${i.maxTokens},`] : []),
    `});`,
    `console.log(resp.choices[0].message.content);`,
  ].join("\n");
}

function pyMessages(messages: ChatMessage[]): string {
  const items = messages.map((m) => `{"role": "${m.role}", "content": ${JSON.stringify(m.content)}}`);
  return `[${items.join(", ")}]`;
}

export type CodeLang = "curl" | "python" | "node";

export function genCode(lang: CodeLang, i: CodeGenInput): string {
  if (lang === "curl") return genCurl(i);
  if (lang === "python") return genPython(i);
  return genNode(i);
}
