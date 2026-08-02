import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "okayLetMeSortItOutFor": "好的，我来帮你梳理一下。瀚枢 HanHub 作为多厂商 LLM 网关，核心价值是「一个 base_url + 一把密钥」即可路由十余家上游，并自动做加权负载均衡与被动失败转移。\n\n你可以在「健康探测」页查看各上游渠道的实时延迟与成功率，在「用量日志」逐请求追溯计费明细。",
    "thisIsAVeryGoodQuestionTo": "这是一个很好的问题。简单来说：网关在收到请求后，会按渠道权重与优先级选择健康的上游，调用成功则按 input/output token 分别计价并乘以分组倍率，失败则触发熔断转移到备用渠道。\n\n整个链路通常在 1 秒内完成，详细耗时拆解可在日志详情的「调用链路」时间线里看到。",
    "gotItBasedOnTheCurrentParameter": "明白。基于当前参数配置，我建议你优先选择性价比更高的模型来处理批量任务，把旗舰模型留给需要复杂推理的场景。这样既能保证质量，又能把每百万 token 的成本压下来。\n\n右侧计费面板会实时累计本次会话的 prompt / completion 用量与预估花费。",
    "noProblemIUnderstandYourNeedsAccording": "没问题。我已经理解你的需求。按 OpenAI 兼容协议，你只需把 base_url 指向 https://api.hanhub.cn/v1，换上瀚枢密钥，原有的 OpenAI SDK 代码无需改动即可切换到任意上游模型。\n\n点击上方「查看为代码」可一键生成 curl / Python / Node 三种语言的接入片段。",
  },
  en: {
    "okayLetMeSortItOutFor": "Okay, let me sort it out for you. HanHub As a multi-vendor LLM gateway, HanHub's core value is that \"one base_url + one key\" can route more than ten upstreams, and automatically perform weighted load balancing and passive failover.\n\nYou can check the real-time delay and success rate of each upstream channel on the \"Health Detection\" page, and trace the billing details on a request-by-request basis in the \"Usage Log\".",
    "thisIsAVeryGoodQuestionTo": "After receiving a request, the gateway selects a healthy upstream by channel priority and weight. A successful call is billed by input and output tokens, adjusted by the group multiplier. A failed call trips the circuit breaker and fails over to a backup channel.\n\nThe end-to-end request usually completes within one second. Open the Request path timeline in log details for a latency breakdown.",
    "gotItBasedOnTheCurrentParameter": "Got it. Based on the current parameter configuration, I suggest you give priority to more cost-effective models to handle batch tasks, leaving the flagship model for scenarios that require complex reasoning. This can not only ensure quality, but also reduce the cost per million tokens.\n\nThe billing panel on the right will accumulate the prompt/completion usage and estimated cost of this session in real time.",
    "noProblemIUnderstandYourNeedsAccording": "No problem. I understand your needs. According to the OpenAI compatible protocol, you only need to point the base_url to https://api.hanhub.cn/v1, replace it with the HanHub key, and the original OpenAI SDK code can be switched to any upstream model without modification.\n\nClick \"View as Code\" above to generate access snippets in three languages: curl / Python / Node with one click.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-playground-use-run",
  content: t(content),
};

export default dictionary;
