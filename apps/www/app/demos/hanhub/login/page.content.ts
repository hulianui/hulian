import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "oneBaseUrlMoreThanTenUpstreams": "一个 base_url，十余家上游",
    "openaiClaudeGeminiDeepseekQwenAreFully": "OpenAI / Claude / Gemini / DeepSeek / Qwen 全 OpenAI 兼容",
    "healthDetectionAutomaticFuseTransfer": "健康探测 + 自动熔断转移",
    "channelSpeedTestingPassiveFailoverThresholdCircuit": "渠道测速、被动失败转移、阈值熔断，可用性兜底",
    "perRequestCostObservable": "逐请求成本可观测",
    "inputOutputScoresRatiosAndQuotasAre": "input/output 分计、倍率、配额，每一次调用都算得清",
    "pivot": "枢",
    "hanhubHanhub": "瀚枢 HanHub",
    "oneStopShop": "一站式",
    "largeModelApiTransitGateway": "大模型 API 中转网关",
    "unifiedAccessIntelligentRoutingHealthDetectionAnd": "统一接入、智能路由、健康探测、逐请求计费 —— 把多家大模型收拢到一把密钥背后。",
    "hanhubHanhubBuiltInExamples": "© 2026 瀚枢 HanHub · 内置示例",
    "pivot2": "枢",
    "hanhubHanhub2": "瀚枢 HanHub",
    "logInToTheGatewayConsole": "登录网关控制台",
    "forgotPassword": "忘记密码",
    "applyForAccess": "申请接入",
    "demoEnvironmentFillInAnyUsernamePassword": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "oneBaseUrlMoreThanTenUpstreams": "One base_url, more than ten upstreams",
    "openaiClaudeGeminiDeepseekQwenAreFully": "OpenAI / Claude / Gemini / DeepSeek / Qwen are fully OpenAI compatible",
    "healthDetectionAutomaticFuseTransfer": "Health detection + automatic fuse transfer",
    "channelSpeedTestingPassiveFailoverThresholdCircuit": "Channel speed testing, passive failover, threshold circuit breaker, and guaranteed availability",
    "perRequestCostObservable": "Per-request cost observable",
    "inputOutputScoresRatiosAndQuotasAre": "Input/output scores, ratios, and quotas are calculated for every call.",
    "pivot": "pivot",
    "hanhubHanhub": "HanHub HanHub",
    "oneStopShop": "one stop shop",
    "largeModelApiTransitGateway": "Large model API transit gateway",
    "unifiedAccessIntelligentRoutingHealthDetectionAnd": "Unified access, intelligent routing, health detection, and per-request billing - gather multiple large models behind one key.",
    "hanhubHanhubBuiltInExamples": "© 2026 HanHub HanHub · Built-in examples",
    "pivot2": "pivot",
    "hanhubHanhub2": "HanHub HanHub",
    "logInToTheGatewayConsole": "Log in to the gateway console",
    "forgotPassword": "Forgot password",
    "applyForAccess": "Apply for access",
    "demoEnvironmentFillInAnyUsernamePassword": "Demo environment: fill in any username/password to log in",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-login-page",
  content: t(content),
};

export default dictionary;
