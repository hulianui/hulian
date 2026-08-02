import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "anthropicOfficial": "Anthropic 官方",
    "productionEnvironmentMainService": "生产环境 · 主服务",
    "youAreANeatWeatherAssistant": "你是一个简洁的天气助手。",
    "isHangzhouSuitableForOutdoorUseToday": "杭州今天适合户外吗？",
    "checkCityWeather": "查询城市天气",
    "cityHangzhou": "{\"city\":\"杭州\"}",
    "openaiOfficialMain": "OpenAI 官方 · 主",
    "mobileApp": "移动端 App",
    "explainRagInOneSentence": "用一句话解释 RAG。",
    "ragIsAMethodThatFirstRetrieves": "RAG 是先从知识库检索相关片段、再让大模型基于这些片段生成回答的方法。",
    "deepseekOfficial": "DeepSeek 官方",
    "dataDashboardReadOnlyAnalysis": "数据看板 · 只读分析",
    "summarizeTheMonthOnMonthTrendOf": "汇总这段销售数据的环比趋势……",
    "theOverallMonthOnMonthIncreaseWas": "整体环比上升 12.4%……",
    "darkSideOfTheMoon": "月之暗面",
    "experimentPlayground": "实验 · Playground",
    "writeAPoemAboutAutumn": "写一首关于秋天的诗。",
    "upstreamChannelDarkSideOfTheMoon": "Upstream channel 月之暗面 timed out after 30000ms; request failed over but no healthy channel.",
    "openaiOfficialMain2": "OpenAI 官方 · 主",
    "productionEnvironmentMainService2": "生产环境 · 主服务",
    "translateTheFollowingItemsInBatches": "批量翻译以下 50 条……",
    "rateLimitReachedForKeyProductionEnvironment": "Rate limit reached for key 「生产环境 · 主服务」: 600 RPM. Please retry after 1s.",
    "mobileApp2": "移动端 App",
    "whatBrandsAreThereInThisPicture": "看这张图里有哪些品牌？",
    "brandsCanBeIdentifiedInThePicture": "图中可识别到 3 个品牌……",
    "anthropicOfficial2": "Anthropic 官方",
    "dataDashboardReadOnlyAnalysis2": "数据看板 · 只读分析",
    "rewriteThisSentenceToBeMorePolite": "把这句话改写得更礼貌。",
    "okOptimizedForYou": "好的，已为你优化……",
    "aliBailian": "阿里百炼",
    "productionEnvironmentMainService3": "生产环境 · 主服务",
    "generateMarketingCopy": "生成营销文案……",
    "channelAlibabaBailianIsUnderMaintenanceNo": "Channel 阿里百炼 is under maintenance. No alternative channel serves model qwen3-max.",
  },
  en: {
    "anthropicOfficial": "Anthropic official",
    "productionEnvironmentMainService": "Production environment · Main service",
    "youAreANeatWeatherAssistant": "You are a neat weather assistant.",
    "isHangzhouSuitableForOutdoorUseToday": "Is Hangzhou suitable for outdoor use today?",
    "checkCityWeather": "Check city weather",
    "cityHangzhou": "{\"city\":\"Hangzhou\"}",
    "openaiOfficialMain": "OpenAI official · main",
    "mobileApp": "Mobile App",
    "explainRagInOneSentence": "Explain RAG in one sentence.",
    "ragIsAMethodThatFirstRetrieves": "RAG is a method that first retrieves relevant snippets from a knowledge base and then lets a large model generate answers based on these snippets.",
    "deepseekOfficial": "DeepSeek official",
    "dataDashboardReadOnlyAnalysis": "Data dashboard · Read-only analysis",
    "summarizeTheMonthOnMonthTrendOf": "Summarize the month-on-month trend of this period of sales data...",
    "theOverallMonthOnMonthIncreaseWas": "The overall month-on-month increase was 12.4%...",
    "darkSideOfTheMoon": "dark side of the moon",
    "experimentPlayground": "Experiment · Playground",
    "writeAPoemAboutAutumn": "Write a poem about autumn.",
    "upstreamChannelDarkSideOfTheMoon": "Upstream channel Dark Side of the Moon timed out after 30000ms; request failed over but no healthy channel.",
    "openaiOfficialMain2": "OpenAI official · main",
    "productionEnvironmentMainService2": "Production environment · Main service",
    "translateTheFollowingItemsInBatches": "Translate the following 50 items in batches...",
    "rateLimitReachedForKeyProductionEnvironment": "Rate limit reached for key \"Production environment · Main service\": 600 RPM. Please retry after 1s.",
    "mobileApp2": "Mobile App",
    "whatBrandsAreThereInThisPicture": "What brands are there in this picture?",
    "brandsCanBeIdentifiedInThePicture": "3 brands can be identified in the picture...",
    "anthropicOfficial2": "Anthropic official",
    "dataDashboardReadOnlyAnalysis2": "Data dashboard · Read-only analysis",
    "rewriteThisSentenceToBeMorePolite": "Rewrite this sentence to be more polite.",
    "okOptimizedForYou": "OK, optimized for you...",
    "aliBailian": "Ali Bailian",
    "productionEnvironmentMainService3": "Production environment · Main service",
    "generateMarketingCopy": "Generate marketing copy...",
    "channelAlibabaBailianIsUnderMaintenanceNo": "Channel Alibaba Bailian is under maintenance. No alternative channel serves model qwen3-max.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-data-logs",
  content: t(content),
};

export default dictionary;
